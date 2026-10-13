import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProjectModal from '../components/ProjectModal';
import { projectService } from '../services/projectService';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      const newProj = await projectService.createProject(projectData);
      setProjects((prev) => [...prev, newProj]);
    } catch (err) {
      alert(err.message || 'Không thể tạo dự án');
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ color: 'black' }} className="text-2xl font-bold mb-6">Danh sách dự án</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Tạo Dự Án Mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Đang tải dự án...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
          Chưa tham gia dự án nào. Hãy tạo dự án mới!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}`)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{proj.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                  {proj.description || 'Không có mô tả'}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t flex justify-between">
                <span>Bắt đầu: {proj.start_date || 'N/A'}</span>
                <span>Kết thúc: {proj.end_date || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </MainLayout>
  );
}