export default function Modal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card max-w-sm w-full shadow-md bg-surface">
        <h3 className="mb-4">{title}</h3>
        <p className="mb-6 text-muted">{message}</p>
        <div className="flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  );
}