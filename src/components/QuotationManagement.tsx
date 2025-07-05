import  { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { getAllQuotations, getSupplierQuotations } from '../services/api';


const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "approved":
      return "text-blue-600 bg-blue-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};



const QuotationManagement = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      // Fetch all quotations for admin
      getAllQuotations().then((data) => {
        setQuotations(data.quotations);
      });
    } else if (user?.role === 'supplier') {
      // Fetch supplier-specific quotations for suppliers
      getSupplierQuotations().then((data) => {
        setQuotations(data.quotations);
      });
    }
  }, [user]);

  return (
    <div className="container p-6 sm:pl-[18rem]">
      <h2 className="text-2xl font-semibold mb-4">Quotation Management</h2>
      
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-2 text-sm sm:text-base">Creation Date</th>
               <th className="px-4 py-2 text-sm sm:text-base">Status</th>
              <th className="px-4 py-2 text-sm sm:text-base">Submitted By</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length > 0 ? (
              quotations.map((quotation: any) => (
                <tr key={quotation._id}>
                 <td className="px-4 py-2 text-sm sm:text-base">
                    {new Date(quotation.date).toLocaleDateString()}
                  </td>
                    <td>
                      <span
                        className={`px-2 py-2 rounded text-sm sm:text-base ${getStatusColor(quotation.status)}`}
                      >
                        {quotation.status}
                      </span>
                    </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {quotation.supplierId.username}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-sm sm:text-base text-center">
                  No quotations available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationManagement;
