import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaFolder,
  FaFolderOpen,
  FaEye,
  FaArchive,
  FaCheckCircle
} from "react-icons/fa";

export default function ProjectManagement({ onProjectSelect, selectedProjectId }) {
  const token = sessionStorage.getItem("clienttoken");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
    status: "active"
  });
  const [addingProject, setAddingProject] = useState(false);
  const [addProjectError, setAddProjectError] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:8000/api/v1/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(
        error.response?.data?.message || "Error fetching projects"
      );
    } finally {
      setLoading(false);
    }
  };

  // Add new project
  const handleAddProject = async () => {
    if (!newProjectData.name) {
      setAddProjectError("Project name is required");
      return;
    }

    try {
      setAddingProject(true);
      setAddProjectError(null);

      const response = await axios.post(
        "http://localhost:8000/api/v1/projects",
        newProjectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        fetchProjects();
        setNewProjectData({ name: "", description: "", status: "active" });
        setShowAddProjectModal(false);
      }
    } catch (error) {
      console.error("Error adding project:", error);
      setAddProjectError(
        error.response?.data?.message || "Error adding project"
      );
    } finally {
      setAddingProject(false);
    }
  };

  // Edit project
  const handleEditProject = async () => {
    if (!editingProject.name) {
      setAddProjectError("Project name is required");
      return;
    }

    try {
      setAddingProject(true);
      setAddProjectError(null);

      const response = await axios.put(
        `http://localhost:8000/api/v1/projects/${editingProject._id}`,
        {
          name: editingProject.name,
          description: editingProject.description,
          status: editingProject.status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        fetchProjects();
        setShowEditProjectModal(false);
        setEditingProject(null);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      setAddProjectError(
        error.response?.data?.message || "Error updating project"
      );
    } finally {
      setAddingProject(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        fetchProjects();
        setShowDeleteConfirmModal(false);
        setProjectToDelete(null);
        // If the deleted project was selected, clear selection
        if (selectedProjectId === projectId) {
          onProjectSelect(null);
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(
        error.response?.data?.message || "Error deleting project"
      );
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FaFolderOpen className="text-green-600" />;
      case "archived":
        return <FaArchive className="text-gray-600" />;
      case "completed":
        return <FaCheckCircle className="text-blue-600" />;
      default:
        return <FaFolder className="text-gray-600" />;
    }
  };

  // Add Project Modal
  const renderAddProjectModal = () => {
    if (!showAddProjectModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
          <div className="px-6 py-4 border-b border-gray-200 relative">
            <h5 className="text-lg font-semibold text-gray-900">Add New Project</h5>
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddProjectModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {addProjectError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                {addProjectError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
                value={newProjectData.name}
                onChange={(e) =>
                  setNewProjectData({
                    ...newProjectData,
                    name: e.target.value,
                  })
                }
                disabled={addingProject}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter project description"
                value={newProjectData.description}
                onChange={(e) =>
                  setNewProjectData({
                    ...newProjectData,
                    description: e.target.value,
                  })
                }
                disabled={addingProject}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newProjectData.status}
                onChange={(e) =>
                  setNewProjectData({
                    ...newProjectData,
                    status: e.target.value,
                  })
                }
                disabled={addingProject}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              onClick={() => setShowAddProjectModal(false)}
              disabled={addingProject}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleAddProject}
              disabled={addingProject}
            >
              {addingProject ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Project Modal
  const renderEditProjectModal = () => {
    if (!showEditProjectModal || !editingProject) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
          <div className="px-6 py-4 border-b border-gray-200 relative">
            <h5 className="text-lg font-semibold text-gray-900">Edit Project</h5>
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowEditProjectModal(false);
                setEditingProject(null);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {addProjectError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                {addProjectError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
                value={editingProject.name}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    name: e.target.value,
                  })
                }
                disabled={addingProject}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter project description"
                value={editingProject.description}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    description: e.target.value,
                  })
                }
                disabled={addingProject}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProject.status}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    status: e.target.value,
                  })
                }
                disabled={addingProject}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              onClick={() => {
                setShowEditProjectModal(false);
                setEditingProject(null);
              }}
              disabled={addingProject}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleEditProject}
              disabled={addingProject}
            >
              {addingProject ? (
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

  // Delete Confirmation Modal
  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirmModal || !projectToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 relative">
          <div className="px-6 py-4 border-b border-gray-200 relative">
            <h5 className="text-lg font-semibold text-gray-900">Confirm Delete</h5>
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setProjectToDelete(null);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700">
              Are you sure you want to delete "{projectToDelete.name}"? This
              action cannot be undone.
            </p>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setProjectToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              onClick={() => handleDeleteProject(projectToDelete._id)}
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="border-0 shadow-sm rounded-lg min-h-screen w-full overflow-hidden">
        <div className="p-2 md:p-3 lg:p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-0">Projects</h3>
            <button
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              onClick={() => setShowAddProjectModal(true)}
            >
              <FaPlus className="mr-2" /> Add Project
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="animate-spin inline-block text-2xl mb-3" />
              <p>Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedProjectId === project._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => onProjectSelect(project._id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      {getStatusIcon(project.status)}
                      <h4 className="ml-2 font-semibold text-gray-900 truncate">
                        {project.name}
                      </h4>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setShowEditProjectModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setShowDeleteConfirmModal(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <FaFolder className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No projects created yet.</p>
              <p className="text-gray-500">
                Click "Add Project" to create your first project.
              </p>
            </div>
          )}
        </div>
      </div>
      {renderAddProjectModal()}
      {renderEditProjectModal()}
      {renderDeleteConfirmModal()}
    </>
  );
}
