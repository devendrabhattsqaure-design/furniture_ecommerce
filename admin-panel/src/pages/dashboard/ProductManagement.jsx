import React, { useState, useEffect } from "react";
import { CubeIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [orgId, setOrgId] = useState(null);

  const [formData, setFormData] = useState({
    product_name: '',
    slug: '',
    sku: '',
    category_id: '',
    brand: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    material: '',
    color: '',
    dimensions: '',
    weight: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
    is_on_sale: false,
    is_active: true
  });

 
 useEffect(() => {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    const userObj = JSON.parse(storedUser);   
    const orgId = userObj.org_id;             

    console.log(orgId, 'ORG ID');
    setOrgId(orgId);
    fetchProducts(orgId)
    fetchCategories(orgId);
  }
}, []);


  const fetchProducts = async (orgId) => {
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        headers: {
          'x-org-id': orgId
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        console.error('Error fetching products:', result.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async (orgId) => {
    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'x-org-id': orgId
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Error fetching categories:', result.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!orgId) {
      alert('Organization not found!');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct.product_id}`
        : 'http://localhost:5000/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'x-org-id': orgId
        },
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Backend response:', result);

      if (result.success) {
        console.log('Product saved successfully:', result.data);
        
        // Refresh the products list
        await fetchProducts(orgId);
        
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          product_name: '',
          slug: '',
          sku: '',
          category_id: '',
          brand: '',
          description: '',
          short_description: '',
          price: '',
          compare_price: '',
          cost_price: '',
          material: '',
          color: '',
          dimensions: '',
          weight: '',
          stock_quantity: '',
          low_stock_threshold: '10',
          is_featured: false,
          is_bestseller: false,
          is_new_arrival: false,
          is_on_sale: false,
          is_active: true
        });
        setImages([]);
        setImagePreviews([]);
        setExistingImages([]);
        
      } else {
        alert(result.message || 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  
 const handleEdit = async (product) => {
    try {
      // Fetch the complete product data with images
      const response = await fetch(`http://localhost:5000/api/products/${product.product_id}`);
      const result = await response.json();
      
      if (result.success) {
        const productData = result.data;
        
        setEditingProduct(productData);
        setFormData({
          product_name: productData.product_name || '',
          slug: productData.slug || '',
          sku: productData.sku || '',
          category_id: productData.category_id || '',
          brand: productData.brand || '',
          description: productData.description || '',
          short_description: productData.short_description || '',
          price: productData.price || '',
          compare_price: productData.compare_price || '',
          cost_price: productData.cost_price || '',
          material: productData.material || '',
          color: productData.color || '',
          dimensions: productData.dimensions || '',
          weight: productData.weight || '',
          stock_quantity: productData.stock_quantity || '',
          low_stock_threshold: productData.low_stock_threshold || '10',
          // Ensure boolean fields are properly set from existing data
          is_featured: Boolean(productData.is_featured),
          is_bestseller: Boolean(productData.is_bestseller),
          is_new_arrival: Boolean(productData.is_new_arrival),
          is_on_sale: Boolean(productData.is_on_sale),
          is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true
        });
        
        // Set existing images
        setExistingImages(productData.images || []);
        setImages([]);
        setImagePreviews([]);
        setShowModal(true);
      } else {
        alert('Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert('Error fetching product details');
    }
  };
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      slug: '',
      sku: '',
      category_id: '',
      brand: '',
      description: '',
      short_description: '',
      price: '',
      compare_price: '',
      cost_price: '',
      material: '',
      color: '',
      dimensions: '',
      weight: '',
      stock_quantity: '',
      low_stock_threshold: '10',
      is_featured: false,
      is_bestseller: false,
      is_new_arrival: false,
      is_on_sale: false,
      is_active: true
    });
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
  if (!window.confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      // Remove the product from the local state
      setProducts(products.filter(product => product.product_id !== productId));
      alert('Product deleted successfully');
    } else {
      alert(result.message || 'Error deleting product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error deleting product');
  }
};

  return (
    <div className="mt-12">
      {/* Stats Cards */}
      <div className="mb-8 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <CubeIcon className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Total Products
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              {products.length}
            </h4>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="mb-4 rounded-lg bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Product Management</h2>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.product_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.images && product.images[0] && (
                        <img 
                          src={product.images[0].image_url} 
                          alt={product.product_name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.product_name}
                        </div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Compare Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compare Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="compare_price"
                    value={formData.compare_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Product Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Images {!editingProduct && '*'}
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingProduct} // Required only for new products
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct ? 'Add new images (existing images will be kept)' : 'Upload product images (multiple images allowed)'}
                  </p>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((image, index) => (
                          <div key={image.image_id} className="relative">
                            <img
                              src={image.image_url}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">New Images:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Featured
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_bestseller"
                      checked={formData.is_bestseller}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Bestseller
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_new_arrival"
                      checked={formData.is_new_arrival}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    New Arrival
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_on_sale"
                      checked={formData.is_on_sale}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    On Sale
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>

                {/* Form Actions */}
                <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;