import React from "react";



const SliderManagement = () => {
  return (
    <div className="mt-12">
      <div className="mb-4 rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Slider Management</h2>
        <div className="mb-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add New Slide
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <img src="https://via.placeholder.com/300x150" alt="Slide 1" className="w-full h-32 object-cover rounded mb-2" />
            <h3 className="font-semibold">Slide 1</h3>
            <p className="text-sm text-gray-600">Main Banner</p>
            <div className="mt-2 flex space-x-2">
              <button className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
              <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderManagement;