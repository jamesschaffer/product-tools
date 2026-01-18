import { useLocation } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const location = useLocation();

  const getCurrentViewName = () => {
    switch (location.pathname) {
      case '/gantt':
        return 'Gantt Chart';
      case '/slide':
        return 'Slide View';
      case '/edit':
        return 'Edit View';
      default:
        return 'Current View';
    }
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Export the <span className="font-medium">{getCurrentViewName()}</span> for sharing or printing.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-1 font-medium text-gray-900">Print / Save as PDF</h3>
            <p className="mb-3 text-sm text-gray-500">
              Opens the browser print dialog. Use "Save as PDF" to create a PDF file.
            </p>
            <Button onClick={handlePrint}>Print View</Button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-1 font-medium text-gray-400">Export as PNG</h3>
            <p className="text-sm text-gray-400">
              Coming soon - export the view as a high-resolution image.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
