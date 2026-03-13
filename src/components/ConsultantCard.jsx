import React from 'react';

export default function ConsultantCard({ consultant }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{consultant.name}</h3>
          <p className="text-gray-600">{consultant.role}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{consultant.rating}</span>
          <p className="text-sm text-gray-500">/5.0</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">{consultant.bio}</p>
      <div className="flex flex-wrap gap-2">
        {consultant.skills && consultant.skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
