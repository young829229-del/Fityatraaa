import { Activity, Clock, User, Shield } from 'lucide-react';
import { AdminActivity } from '../../types';

interface AdminActivityTabProps {
  activities: AdminActivity[];
}

export default function AdminActivityTab({ activities = [] }: AdminActivityTabProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Activity Log
        </h2>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5">
        {activities.length === 0 ? (
          <div className="text-center text-neutral-400 text-xs py-10">
            No activities logged yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
            {activities.map((act) => {
              const date = new Date(act.createdAt);
              const dateStr = date.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const timeStr = date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={act.id} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-neutral-900 border-2 border-white ring-2 ring-neutral-300" />

                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">
                        {act.action}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {dateStr} • {timeStr}
                      </span>
                    </div>

                    {act.details && (
                      <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                        {act.details}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono pt-1">
                      <Shield className="w-3 h-3 text-neutral-500" />
                      <span>By: {act.adminEmail || 'admin@fityatra.com'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
