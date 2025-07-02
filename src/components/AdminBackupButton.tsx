const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminBackupButton = () => {
  const handleBackupClick = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/user/backup`, {
        method: "GET",
        headers: {
          Accept: "application/zip", // Indicate that we expect a ZIP file
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error generating backup.");
      }

      // Create a Blob from the response and download it
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `database_backup_${new Date().toISOString().slice(0, 7)}.zip`; // File name with current date
      link.click();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <button
      onClick={handleBackupClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Backup Database
    </button>
  );
};

export default AdminBackupButton;
