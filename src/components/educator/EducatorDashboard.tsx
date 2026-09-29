'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  GraduationCap, 
  Edit3,
  Download
} from 'lucide-react';
import { IEPRecord } from '@/types';

export function EducatorDashboard() {
  const { iepRecords, updateIEP, setActiveChildId } = useApp();
  const [selectedIep, setSelectedIep] = useState<IEPRecord | null>(null);
  const [editGoalModal, setEditGoalModal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [progressVal, setProgressVal] = useState(80);
  const [reportExported, setReportExported] = useState(false);

  const handleOpenEdit = (iep: IEPRecord) => {
    setSelectedIep(iep);
    setGoalText(iep.iepGoal);
    setProgressVal(iep.progressPercent);
    setEditGoalModal(true);
  };

  const handleSaveIEP = () => {
    if (!selectedIep) return;
    updateIEP(selectedIep.id, {
      iepGoal: goalText,
      progressPercent: progressVal
    });
    setEditGoalModal(false);
  };

  const handleExportReport = () => {
    setReportExported(true);
    setTimeout(() => setReportExported(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2DBD0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E1EEF5] text-[#2C5264] flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C241E]">Classroom & IEP Caseload</h1>
            <p className="text-sm text-[#48544C]">
              Oakridge Neurodiversity Support Hub • Special Education Services
            </p>
          </div>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F4535] text-white text-xs sm:text-sm font-semibold hover:bg-[#1E2D23] transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          {reportExported ? 'IEP Summary Exported!' : 'Export IEP Progress Report'}
        </button>
      </div>

      {/* Classroom Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2DBD0]">
          <span className="text-xs font-bold text-[#6B786F] uppercase">Active Caseload</span>
          <p className="text-2xl font-extrabold text-[#1C241E] mt-1">{iepRecords.length} Learners</p>
          <p className="text-xs text-[#4B6F55] mt-0.5">All profiles active this week</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2DBD0]">
          <span className="text-xs font-bold text-[#6B786F] uppercase">Average IEP Benchmark Progress</span>
          <p className="text-2xl font-extrabold text-[#1C241E] mt-1">
            {Math.round(iepRecords.reduce((acc, r) => acc + r.progressPercent, 0) / iepRecords.length)}%
          </p>
          <p className="text-xs text-[#4B6F55] mt-0.5">+6% improvement from last assessment</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2DBD0]">
          <span className="text-xs font-bold text-[#6B786F] uppercase">Accommodations Compliance</span>
          <p className="text-2xl font-extrabold text-[#1C241E] mt-1">100%</p>
          <p className="text-xs text-[#6B786F] mt-0.5">Sensory configurations mapped</p>
        </div>
      </div>

      {/* Student IEP Caseload Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1C241E]">Individualized Education Plan (IEP) Benchmarks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {iepRecords.map((iep) => (
            <div
              key={iep.id}
              className="p-6 rounded-3xl bg-white border border-[#E2DBD0] flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E5EDE6] text-[#2F4535]">
                    {iep.supportTier}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(iep)}
                    className="p-1.5 rounded-lg text-[#6B786F] hover:bg-[#F3EFE6] transition-colors"
                    title="Edit IEP Goal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-[#1C241E] mb-1">{iep.studentName}</h3>
                <p className="text-xs text-[#6B786F] mb-4">Last interaction: {iep.lastSessionDate}</p>

                {/* IEP Goal */}
                <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D5] mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8673E] block mb-1">
                    Current Milestone Goal:
                  </span>
                  <p className="text-xs sm:text-sm text-[#1C241E] font-medium leading-relaxed">
                    {iep.iepGoal}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#48544C]">
                    <span>Progress to Goal</span>
                    <span className="font-bold text-[#1C241E]">{iep.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E8E2D5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4B6F55] rounded-full transition-all"
                      style={{ width: `${iep.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Accommodations */}
                <div>
                  <span className="text-xs font-bold text-[#48544C] block mb-1.5">Classroom Accommodations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {iep.accommodations.map((acc, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-[#F3EFE6] text-[#48544C]">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveChildId(iep.childId);
                  }}
                  className="w-full py-2 rounded-xl bg-[#F4F7F4] hover:bg-[#E5EDE6] text-[#2F4535] text-xs font-bold transition-colors"
                >
                  Inspect Learner Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit IEP Modal */}
      {editGoalModal && selectedIep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#DCE4DD] shadow-xl">
            <h3 className="text-xl font-bold text-[#1C241E] mb-2">
              Update Benchmark for {selectedIep.studentName}
            </h3>
            <p className="text-xs text-[#48544C] mb-4">
              Calibrate milestones according to recent clinical assessment and sensory tolerance.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C241E] mb-1">
                  IEP Objective Statement
                </label>
                <textarea
                  rows={3}
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#DCE4DD] text-xs sm:text-sm text-[#1C241E] focus:outline-[#4B6F55]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C241E] mb-1">
                  Assessed Mastery Progress ({progressVal}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full h-2 bg-[#E2DBD0] rounded-lg accent-[#4B6F55]"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
              <button
                onClick={() => setEditGoalModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F3EFE6] text-[#48544C]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIEP}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#4B6F55] text-white hover:bg-[#3D5A45]"
              >
                Save Benchmark
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
