import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Image, Eye, EyeOff, Upload } from "lucide-react";

const Modal = React.memo(({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
});

// Extract CategoryForm as a separate memoized component
const CategoryForm = React.memo(({ 
  formData, 
  imagePreview, 
  onInputChange, 
  onImageChange, 
  onRemoveImage, 
  onSubmit, 
  onCancel, 
  loading, 
  submitText 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Category Name *</label>
          <input
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-2">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium mb-2">Display Order</label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Image</label>

          {imagePreview && (
            <div className="relative inline-block mb-3">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300" 
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload size={20} className="text-gray-600" />
            <span className="text-base font-medium text-gray-700">Choose Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG up to 5MB</p>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              name="is_active" 
              checked={formData.is_active} 
              onChange={onInputChange} 
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            Active
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              name="show_in_menu" 
              checked={formData.show_in_menu} 
              onChange={onInputChange} 
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            Show in Menu
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          <button 
            disabled={loading} 
            type="submit" 
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              submitText
            )}
          </button>
        </div>
      </div>
    </form>
  );
});

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [orgId, setOrgId] = useState(null); 

  const [formData, setFormData] = useState({
    category_name: "",
    slug: "",
    description: "",
    image: null,
    is_active: true,
    show_in_menu: true,
    display_order: 0
  });

   useEffect(() => {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    const userObj = JSON.parse(storedUser);   
    const orgId = userObj.org_id;             

    console.log(orgId, 'ORG ID');
    setOrgId(orgId);
    fetchCategories(orgId);
  }
}, []);


 const fetchCategories = useCallback(async (orgId) => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        headers: {
          'x-org-id': orgId,
          // If using JWT auth, include authorization header
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
    setLoading(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      category_name: "",
      slug: "",
      description: "",
      image: null,
      is_active: true,
      show_in_menu: true,
      display_order: 0
    });
    setImagePreview(null);
  }, []);

  // -----------------------------
  // MODAL CLOSE HANDLERS
  // -----------------------------
  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    resetForm();
  }, [resetForm]);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    resetForm();
  }, [resetForm]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  }, []);

  // -----------------------------
  // CRUD OPERATIONS
  // -----------------------------
   const handleAdd = useCallback(async () => {
    if (!formData.category_name.trim()) return alert("Category name required!");
    if (!orgId) return alert("Organization not found!");

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('category_name', formData.category_name);
      fd.append('slug', formData.slug);
      fd.append('description', formData.description);
      fd.append('is_active', formData.is_active);
      fd.append('show_in_menu', formData.show_in_menu);
      fd.append('display_order', formData.display_order);
      
      if (formData.image) {
        fd.append("image", formData.image);
      }

      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          'x-org-id': orgId,
          // If using auth: 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: fd
      });

      const data = await res.json();
      if (data.success) {
        closeAddModal();
        fetchCategories(orgId);
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error("Add error:", e);
      alert("Error adding category");
    }

    setLoading(false);
  }, [formData, orgId, fetchCategories, closeAddModal]);
  const handleEdit = useCallback(async () => {
  if (!formData.category_name.trim()) return alert("Category name required!");

  setLoading(true);

  try {
    // Read org id directly from localStorage
    const storedUser = localStorage.getItem("user");
    const orgId = storedUser ? JSON.parse(storedUser).org_id : null;
console.log(orgId, 'ORG IvfD');
    if (!orgId) {
      alert("Organization not found!");
      setLoading(false);
      return;
    }

    const fd = new FormData();
    fd.append("category_name", formData.category_name);
    fd.append("slug", formData.slug);
    fd.append("description", formData.description);
    fd.append("is_active", formData.is_active);
    fd.append("show_in_menu", formData.show_in_menu);
    fd.append("display_order", formData.display_order);

    if (formData.image) {
      fd.append("image", formData.image);
    }

    // Add org_id for backend validation
    fd.append("org_id", orgId);

    const res = await fetch(
      `http://localhost:5000/api/categories/${selectedCategory.category_id}`,
      {
        method: "PUT",
        headers: {
          "x-org-id": orgId
        },
        body: fd
      }
    );

    const data = await res.json();
    if (data.success) {
      closeEditModal();
      fetchCategories(orgId);
    } else {
      alert(data.message);
    }
  } catch (e) {
    console.error("Edit error:", e);
    alert("Error updating category");
  }

  setLoading(false);
}, [formData, selectedCategory, fetchCategories, closeEditModal]);


 const handleDelete = useCallback(async () => {
  setLoading(true);

  try {
    // Get org_id from localStorage
    const storedUser = localStorage.getItem("user");
    const orgId = storedUser ? JSON.parse(storedUser).org_id : null;

    if (!orgId) {
      alert("Organization not found!");
      setLoading(false);
      return;
    }

    const res = await fetch(
      `http://localhost:5000/api/categories/${selectedCategory.category_id}`,
      {
        method: "DELETE",
        headers: {
          "x-org-id": orgId,
        }
      }
    );

    const data = await res.json();

    if (data.success) {
      closeDeleteModal();
      fetchCategories(orgId);
    } else {
      alert(data.message);
    }
  } catch (e) {
    console.error("Delete error:", e);
    alert("Error deleting category");
  }

  setLoading(false);
}, [selectedCategory, fetchCategories, closeDeleteModal]);


  // -----------------------------
  // OPEN MODALS
  // -----------------------------
  const openEditModal = useCallback((cat) => {
    setSelectedCategory(cat);
    setFormData({
      category_name: cat.category_name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: null,
      is_active: cat.is_active === 1,
      show_in_menu: cat.show_in_menu === 1,
      display_order: cat.display_order || 0
    });

    setImagePreview(cat.image_url || null);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((cat) => {
    setSelectedCategory(cat);
    setIsDeleteModalOpen(true);
  }, []);

  return (
    <div className="py-6 max-w-7xl mx-auto">
      {/* Stats Card */}
      <div className="mb-8">
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">Total Categories</p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">{categories.length}</h4>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading && categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No categories found. Add your first category!</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.category_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.category_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.category_name}
                          className="h-10 w-10 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {category.category_name}
                        </span>
                        {category.description && (
                          <span className="text-xs text-gray-500 truncate max-w-xs">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.is_active ? (
                        <span className="flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 w-fit">
                          <Eye size={12} className="mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 w-fit">
                          <EyeOff size={12} className="mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.show_in_menu ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add Category">
        <CategoryForm 
          formData={formData}
          imagePreview={imagePreview}
          onInputChange={handleInputChange}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          onSubmit={handleAdd}
          onCancel={closeAddModal}
          loading={loading}
          submitText="Add Category"
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Category">
        <CategoryForm 
          formData={formData}
          imagePreview={imagePreview}
          onInputChange={handleInputChange}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          onSubmit={handleEdit}
          onCancel={closeEditModal}
          loading={loading}
          submitText="Update Category"
        />
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete Category">
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete the category <strong>"{selectedCategory?.category_name}"</strong>?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button 
            onClick={closeDeleteModal} 
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          <button 
            onClick={handleDelete} 
            disabled={loading}
            className="px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Deleting..." : "Delete Category"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManagement;