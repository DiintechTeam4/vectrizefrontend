import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaFileAlt 
} from "react-icons/fa";

export default function Datastore() {
  const token = sessionStorage.getItem("clienttoken")
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [newContentData, setNewContentData] = useState({
    title: "",
    content: "",
  });
  const [addingContent, setAddingContent] = useState(false);
  const [addContentError, setAddContentError] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState("Text"); // Default to Text
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [datastoreContents, setDatastoreContents] = useState([]);
  const [loadingDatastore, setLoadingDatastore] = useState(false);
  const [datastoreError, setDatastoreError] = useState(null);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [showEditContentModal, setShowEditContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  // Helper function to get badge color based on content type
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "Text":
        return "bg-blue-100 text-blue-800";
      case "Image":
        return "bg-green-100 text-green-800";
      case "Video":
        return "bg-blue-100 text-blue-800";
      case "YouTube":
        return "bg-red-100 text-red-800";
      case "Link":
        return "bg-yellow-100 text-yellow-800";
      case "Website":
        return "bg-gray-100 text-gray-800";
      case "PDF":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch datastore contents on component mount
  useEffect(() => {
    fetchDatastoreContents();
  }, []);

  // Fetch datastore contents
  const fetchDatastoreContents = async () => {
    try {
      setLoadingDatastore(true);
      setDatastoreError(null);
      const response = await axios.get(
        "http://localhost:8000/api/v1/datastore/content"
      ,{
        headers:{
            Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setDatastoreContents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching datastore contents:", error);
      setDatastoreError(
        error.response?.data?.message || "Error fetching datastore contents"
      );
    } finally {
      setLoadingDatastore(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/datastore/content/${contentId}`
      );
      if (response.data.success) {
        fetchDatastoreContents();
        setDeleteConfirmModal(false);
        setContentToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      setDatastoreError(
        error.response?.data?.message || "Error deleting content"
      );
    }
  };

  const handleEditContent = async () => {
    if (!editingContent.title) {
      setAddContentError("Title is required");
      return;
    }

    try {
      setAddingContent(true);
      setAddContentError(null);

      const formData = new FormData();
      formData.append("type", editingContent.type);
      formData.append("title", editingContent.title);

      if (editingContent.type === "Text") {
        formData.append("content", editingContent.content);
      } else if (selectedFile) {
        formData.append("contentFile", selectedFile);
      } else if (editingContent.content) {
        formData.append("content", editingContent.content);
      }

      const response = await axios.put(
        `http://localhost:8000/api/v1/datastore/content/${editingContent._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        fetchDatastoreContents();
        setShowEditContentModal(false);
        setEditingContent(null);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error updating content:", error);
      setAddContentError(
        error.response?.data?.message || "Error updating content"
      );
    } finally {
      setAddingContent(false);
    }
  };

  // Add Delete Confirmation Modal
  const renderDeleteContentConfirmModal = () => {
    if (!deleteConfirmModal || !contentToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 relative">
          <div className="px-6 py-4 border-b border-gray-200 relative">
            <h5 className="text-lg font-semibold text-gray-900">Confirm Delete</h5>
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setDeleteConfirmModal(false);
                setContentToDelete(null);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700">
              Are you sure you want to delete "{contentToDelete.title}"? This
              action cannot be undone.
            </p>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              onClick={() => {
                setDeleteConfirmModal(false);
                setContentToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              onClick={() => handleDeleteContent(contentToDelete._id)}
            >
              Delete Content
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Edit Content Modal
  const renderEditContentModal = () => {
    if (!showEditContentModal || !editingContent) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
          <div className="px-6 py-4 border-b border-gray-200 relative">
            <h5 className="text-lg font-semibold text-gray-900">Edit Content</h5>
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowEditContentModal(false);
                setEditingContent(null);
                setSelectedFile(null);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {addContentError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                {addContentError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a title"
                value={editingContent.title}
                onChange={(e) =>
                  setEditingContent({
                    ...editingContent,
                    title: e.target.value,
                  })
                }
                disabled={addingContent}
              />
            </div>

            {editingContent.type === "Text" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter your text content"
                  value={editingContent.content}
                  onChange={(e) =>
                    setEditingContent({
                      ...editingContent,
                      content: e.target.value,
                    })
                  }
                  disabled={addingContent}
                ></textarea>
              </div>
            )}

            {(editingContent.type === "Image" ||
              editingContent.type === "Video" ||
              editingContent.type === "PDF") && (
              <div className="mb-4">
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-600 truncate">
                    Current file:{" "}
                    {editingContent.metadata?.fileName ||
                      editingContent.content}
                  </p>
                </div>
              </div>
            )}

            {(editingContent.type === "YouTube" ||
              editingContent.type === "Link" ||
              editingContent.type === "Website") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${editingContent.type} URL`}
                  value={editingContent.content}
                  onChange={(e) =>
                    setEditingContent({
                      ...editingContent,
                      content: e.target.value,
                    })
                  }
                  disabled={addingContent}
                />
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              onClick={() => {
                setShowEditContentModal(false);
                setEditingContent(null);
                setSelectedFile(null);
              }}
              disabled={addingContent}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleEditContent}
              disabled={addingContent}
            >
              {addingContent ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Add Content Modal
  const renderAddContentModal = () => {
    if (!showAddContentModal) return null;

    const contentTypes = [
      { name: "Text", icon: <FaFileAlt /> },
      { name: "Image", icon: <FaFileAlt /> }, // Replace with actual icons
      { name: "Video", icon: <FaFileAlt /> },
      { name: "YouTube", icon: <FaFileAlt /> },
      { name: "Link", icon: <FaFileAlt /> },
      { name: "Website", icon: <FaFileAlt /> },
      { name: "PDF", icon: <FaFileAlt /> },
    ];

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Add file size and type validation here if needed
        setSelectedFile(file);
        setNewContentData({ ...newContentData, content: file.name }); // Store file name in content for display
        setAddContentError(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
          <div className="px-6 py-4 border-b border-gray-200 relative">
            <h5 className="text-lg font-semibold text-gray-900">Add Content</h5>
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddContentModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {/* Content Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
              >
                <option value="Text">Text</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="PDF">PDF</option>
                <option value="YouTube">YouTube</option>
                <option value="Link">Link</option>
                <option value="Website">Website</option>
              </select>
            </div>

            {addContentError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                {addContentError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a title"
                value={newContentData.title}
                onChange={(e) =>
                  setNewContentData({
                    ...newContentData,
                    title: e.target.value,
                  })
                }
                disabled={addingContent}
              />
            </div>

            {selectedContentType === "Text" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter your text content"
                  value={newContentData.content}
                  onChange={(e) =>
                    setNewContentData({
                      ...newContentData,
                      content: e.target.value,
                    })
                  }
                  disabled={addingContent}
                ></textarea>
              </div>
            )}

            {(selectedContentType === "Image" ||
              selectedContentType === "Video" ||
              selectedContentType === "PDF") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleFileChange}
                  disabled={addingContent}
                  accept={
                    selectedContentType === "Image"
                      ? "image/*"
                      : selectedContentType === "Video"
                      ? "video/*"
                      : ".pdf"
                  }
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-600 truncate">
                      Selected: {selectedFile.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(selectedContentType === "YouTube" ||
              selectedContentType === "Link" ||
              selectedContentType === "Website") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${selectedContentType} URL`}
                  value={newContentData.content}
                  onChange={(e) =>
                    setNewContentData({
                      ...newContentData,
                      content: e.target.value,
                    })
                  }
                  disabled={addingContent}
                />
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              onClick={() => setShowAddContentModal(false)}
              disabled={addingContent}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleAddContent}
              disabled={addingContent}
            >
              {addingContent ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Saving...
                </>
              ) : (
                "Save Content"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add content to datastore
  const handleAddContent = async () => {
    if (!newContentData.title) {
      setAddContentError("Title is required");
      return;
    }

    // Check for content based on type
    if (selectedContentType === "Text" && !newContentData.content) {
      setAddContentError("Content is required for Text type");
      return;
    }

    if (
      (selectedContentType === "Image" ||
        selectedContentType === "Video" ||
        selectedContentType === "PDF") &&
      !selectedFile
    ) {
      setAddContentError(
        `File upload is required for ${selectedContentType} type`
      );
      return;
    }

    if (
      (selectedContentType === "YouTube" ||
        selectedContentType === "Link" ||
        selectedContentType === "Website") &&
      !newContentData.content
    ) {
      setAddContentError(`URL is required for ${selectedContentType} type`);
      return;
    }

    try {
      setAddingContent(true);
      setAddContentError(null);

      const formData = new FormData();
      formData.append("type", selectedContentType);
      formData.append("title", newContentData.title);

      if (selectedContentType === "Text") {
        formData.append("content", newContentData.content);
      } else if (selectedFile) {
        formData.append("contentFile", selectedFile);
        // The backend will handle setting the content field with the S3 key
      } else if (newContentData.content) {
        formData.append("content", newContentData.content); // For URL types
      }

      const response = await axios.post(
        "http://localhost:8000/api/v1/datastore/content",
        formData,
        {
          headers: {
            Authorization:`Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );

      if (response.data.success) {
        fetchDatastoreContents();
        setNewContentData({ title: "", content: "" });
        setSelectedContentType("Text");
        setSelectedFile(null);
        setShowAddContentModal(false);
      } else {
        setAddContentError(response.data.message || "Error adding content");
      }
    } catch (error) {
      console.error("Error adding content:", error);
      setAddContentError(
        error.response?.data?.message || "Error adding content"
      );
    } finally {
      setAddingContent(false);
    }
  };

  return (
    <>
      <div className="border-0 shadow-sm rounded-lg min-h-screen w-full overflow-hidden">
        <div className="p-2 md:p-3 lg:p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-0">Datastore</h3>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search datastore..."
                />
              </div>
              <div className="relative">
                <button
                  className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-between"
                  type="button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  All Types
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFilterDropdown && (
                  <ul className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg py-1">
                    <li>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#">
                        Text
                      </a>
                    </li>
                    <li>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#">
                        Image
                      </a>
                    </li>
                    <li>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#">
                        Video
                      </a>
                    </li>
                    <li>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#">
                        YouTube
                      </a>
                    </li>
                    <li>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#">
                        Link
                      </a>
                    </li>
                    <li>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#">
                        Website
                      </a>
                    </li>
                    <li>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" href="#">
                        PDF
                      </a>
                    </li>
                  </ul>
                )}
              </div>
              <button
                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                onClick={() => setShowAddContentModal(true)}
              >
                <FaPlus className="mr-2" /> Add Content
              </button>
            </div>
          </div>
          {datastoreError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
              {datastoreError}
            </div>
          )}

          {loadingDatastore ? (
            <div className="text-center py-5">
              <FaSpinner className="animate-spin inline-block text-2xl mb-3" />
              <p>Loading datastore contents...</p>
            </div>
          ) : datastoreContents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {datastoreContents.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                        {item.type === "Text" && (
                          <span>
                            {item.metadata?.fileName || "Text Content"}
                          </span>
                        )}
                        {(item.type === "Image" ||
                          item.type === "Video" ||
                          item.type === "PDF") && (
                          <span>
                            File: {item.metadata?.fileName || item.content}
                          </span>
                        )}
                        {(item.type === "YouTube" ||
                          item.type === "Link" ||
                          item.type === "Website") && (
                          <a
                            href={item.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate block max-w-full"
                          >
                            {item.content}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => {
                              setEditingContent(item);
                              setShowEditContentModal(true);
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-md transition-colors"
                            onClick={() => {
                              setContentToDelete(item);
                              setDeleteConfirmModal(true);
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-gray-500">No content added yet.</p>
              <p className="text-gray-500">
                Click "Add Content" to add your first item.
              </p>
            </div>
          )}
        </div>
      </div>
      {renderAddContentModal()}
      {renderDeleteContentConfirmModal()}
      {renderEditContentModal()}
    </>
  );
}
