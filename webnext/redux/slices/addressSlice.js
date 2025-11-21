// redux/slices/addressSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/address.js';

const initialState = {
  addresses: [],
  loading: false,
  error: null,
  selectedAddress: null,
};

// Async thunks
export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      return await getAddresses();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAddress = createAsyncThunk(
  'address/createAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      return await addAddress(addressData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAddressAsync = createAsyncThunk(
  'address/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      return await updateAddress(addressId, addressData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAddressAsync = createAsyncThunk(
  'address/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      await deleteAddress(addressId);
      return addressId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setDefaultAddressAsync = createAsyncThunk(
  'address/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      return await setDefaultAddress(addressId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create address
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update address
      .addCase(updateAddressAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddressAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.addresses.findIndex(addr => addr.address_id === action.payload.address_id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(updateAddressAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete address
      .addCase(deleteAddressAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddressAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter(addr => addr.address_id !== action.payload);
      })
      .addCase(deleteAddressAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Set default address
      .addCase(setDefaultAddressAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddressAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update all addresses - set is_default to true for the target, false for others
        state.addresses.forEach(addr => {
          addr.is_default = addr.address_id === action.payload.address_id;
        });
      })
      .addCase(setDefaultAddressAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;