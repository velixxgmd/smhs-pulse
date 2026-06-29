import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, FileSpreadsheet, File, Loader2, CheckCircle2 } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { exportCSV, exportTXT, exportXLSX, exportPDF, exportResultsPDF } from '../../services/exportService';
import { toast } from 'sonner';
import { ELECTION_ROLES } from '../../lib/constants';

type ExportType = 'csv' | 'txt' | 'xlsx' | 'pdf-codes' | 'pdf-results';

export function AdminExportPage() {
  const [loading, setLoading] = useState<ExportType | null>(null);

  const handleExport = async (type: ExportType) => {
    setLoading(type);
    try {
      const [codes, election] = await Promise.all([
        electionService.exportCodes(),
        electionService.getElection(),
      ]);
      const name = election.name;
      const year = election.year;

      switch (type) {
        case 'csv': exportCSV(codes); break;
        case 'txt': exportTXT(codes); break;
        case 'xlsx': exportXLSX(codes); break;
        case 'pdf-codes': exportPDF(codes, name, year); break;
        case 'pdf-results': {
          const results = await electionService.getResults();
          const roleOrder = new Map<string, number>(ELECTION_ROLES.map((r, i) => [r, i]));
          const sortedResults = {
            ...results,
            results: [...results.results].sort((a, b) => {
              const ai = roleOrder.get(a.role);
              const bi = roleOrder.get(b.role);
              const aKey = ai ?? Number.MAX_SAFE_INTEGER;
              const bKey = bi ?? Number.MAX_SAFE_INTEGER;
              return aKey - bKey;
            }),
          };
          exportResultsPDF(sortedResults, name, year);
          break;
        }
      }
      toast.success('Export downloaded successfully.');
    } catch (e) {
      toast.error(`Export failed: ${e}`);
    } finally {
      setLoading(null);
    }
  };

  const exports: { type: ExportType; icon: React.ReactNode; title: string; description: string; color: string }[] = [
    { type: 'csv', icon: <FileText size={24} />, title: 'CSV Export', description: 'RFC 4180 compliant, UTF-8 BOM for Excel compatibility. Includes all code data.', color: '#22D3EE' },
    { type: 'xlsx', icon: <FileSpreadsheet size={24} />, title: 'Excel Export (.xlsx)', description: 'Styled spreadsheet with auto-width columns, frozen header, and clean formatting.', color: '#22C55E' },
    { type: 'txt', icon: <FileText size={24} />, title: 'Text Export (.txt)', description: 'Human-readable formatted list. Easy to read without spreadsheet software.', color: '#FBBF24' },
    { type: 'pdf-codes', icon: <File size={24} />, title: 'PDF — Code Report', description: 'Official SMHS report with watermark, header, signature block, and paginated code list.', color: '#7C3AED' },
    { type: 'pdf-results', icon: <File size={24} />, title: 'PDF — Election Results', description: 'Official results report with all positions, winners, vote counts, and participation stats.', color: '#A855F7' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Export Center</h1>
        <p className="text-sm" style={{ color: '#71717A' }}>Download election data in multiple formats for teachers and administrators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {exports.map(exp => (
          <motion.div
            key={exp.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="p-3 rounded-xl" style={{ background: `${exp.color}15` }}>
                <div style={{ color: exp.color }}>{exp.icon}</div>
              </div>
              {loading === exp.type && <Loader2 size={16} className="animate-spin" style={{ color: exp.color }} />}
            </div>
            <h3 className="font-bold text-white mb-2">{exp.title}</h3>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: '#71717A' }}>{exp.description}</p>
            <button
              onClick={() => handleExport(exp.type)}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: `${exp.color}18`,
                color: exp.color,
                border: `1px solid ${exp.color}30`,
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                opacity: loading !== null && loading !== exp.type ? 0.5 : 1,
              }}
            >
              {loading === exp.type ? <><Loader2 size={14} className="animate-spin" />Generating...</> : <><Download size={14} />Download</>}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Print note */}
      <div className="mt-8 glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2">Print Notes</h3>
        <ul className="space-y-1">
          {[
            'All exports hide animated backgrounds in print mode.',
            'PDF reports include SMHS official header and watermark.',
            'Code sheets are organized by class and section for easy teacher distribution.',
            'Results PDF includes winner per category and full participation statistics.',
          ].map(note => (
            <li key={note} className="flex items-center gap-2 text-xs" style={{ color: '#71717A' }}>
              <CheckCircle2 size={12} style={{ color: '#22C55E', flexShrink: 0 }} />{note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
