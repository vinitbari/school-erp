import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Grid, ArrowDownUp, ArrowUp, BarChart2, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const dummyData = [
  { uin: 'EK/3201/0041/2627', name: 'Adiyan Imran Parekh', program: 'Euro Senior', status: 'Adjusted against the D Model Inventory' },
  { uin: 'EK/3201/0023/2627', name: 'Affan Baig Mirza', program: 'Euro Junior', status: 'Adjusted against the D Model Inventory' },
  { uin: 'EK/3201/0085/2627', name: 'Amayara Akash Rathod', program: 'Nursery', status: 'D Model PO Adjustment is pending' },
  { uin: 'EK/3201/0051/2627', name: 'Anvi Vijay Keshaowar', program: 'Nursery', status: 'Adjusted against the D Model Inventory' },
  { uin: 'EK/3201/0072/2627', name: 'Ayansh Vikesh Rathod', program: 'Nursery', status: 'Adjusted against the D Model Inventory' },
  { uin: 'EK/3201/0014/2627', name: 'Dnyanda Nandkishor Bawane', program: 'Euro Junior', status: 'Adjusted against the D Model Inventory' },
  { uin: 'EK/3201/0052/2627', name: 'Mahi Sachin Rathod', program: 'Euro Senior', status: 'D Model PO Adjustment is pending' },
  { uin: 'EK/3201/0064/2627', name: 'Nityashree Narendra Halse', program: 'Nursery', status: 'Adjusted against the D Model Inventory' },
  { uin: 'EK/3201/0067/2627', name: 'Priyansh Gopal Pardhi', program: 'Euro Junior', status: 'D Model PO Adjustment is pending' },
  { uin: 'EK/3201/0087/2627', name: 'Virajas Rahul Deshmukh', program: 'Nursery', status: 'D Model PO Adjustment is pending' },
];

const modalData = [
  { program: 'Play Group', count: 6, stockA: 5, stockB: 5, remaining: 0 },
  { program: 'Nursery', count: 33, stockA: 28, stockB: 28, remaining: 0 },
  { program: 'Euro Junior', count: 33, stockA: 16, stockB: 16, remaining: 0 },
  { program: 'Euro Senior', count: 16, stockA: 10, stockB: 10, remaining: 0 },
];

export default function InventoryDetailsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto pb-12 pt-2 space-y-4">
      <h1 className="text-[24px] font-normal text-[#333] mb-4">Inventory Details</h1>
      
      <div className="flex gap-1 mb-4">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#337ab7] hover:bg-[#286090] text-white rounded-[3px] h-8 px-3 text-[13px] font-normal flex gap-2"
        >
          <BarChart2 className="w-4 h-4" />
          Manual Stock Details
        </Button>
        <Button className="bg-[#333] hover:bg-[#222] text-white rounded-[3px] h-8 px-3 text-[13px] font-normal flex gap-2">
          <FileText className="w-4 h-4" />
          Inventory Report
        </Button>
      </div>
      
      <div className="bg-white border border-[#ccc] shadow-sm">
        
        {/* Table Top Toolbar */}
        <div className="p-3 border-b border-[#ccc] bg-[#f9f9f9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#f9f9f9] border border-[#ccc] p-1.5 rounded-sm">
                <Grid className="w-4 h-4 text-slate-600" />
              </div>
              <label className="text-[13px] text-slate-600 flex items-center gap-2">
                Search:
                <Input type="text" className="h-[30px] w-[200px] border-[#ccc] rounded-sm text-[13px] px-2" />
              </label>
            </div>
            
            <div className="flex items-center gap-2 text-[13px] text-slate-600">
              Show 
              <Select defaultValue="10">
                <SelectTrigger className="h-[30px] w-[60px] border-[#ccc] rounded-sm text-[13px] px-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              entries
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#f9f9f9]">
                <th className="py-2.5 px-3 border-r border-b border-[#ccc] text-[13px] font-bold text-[#333] text-center w-[25%]">
                  <div className="flex items-center justify-center">UIN</div>
                </th>
                <th className="py-2.5 px-3 border-r border-b border-[#ccc] text-[13px] font-bold text-[#333] w-[25%]">
                  <div className="flex items-center justify-between">Student Name <ArrowUp className="w-3 h-3 text-[#337ab7]" /></div>
                </th>
                <th className="py-2.5 px-3 border-r border-b border-[#ccc] text-[13px] font-bold text-[#333] w-[20%]">
                  <div className="flex items-center justify-between">ProgramName <ArrowDownUp className="w-3 h-3 text-[#999] opacity-50" /></div>
                </th>
                <th className="py-2.5 px-3 border-b border-[#ccc] text-[13px] font-bold text-[#333] w-[30%]">
                  <div className="flex items-center justify-between">Status <ArrowDownUp className="w-3 h-3 text-[#999] opacity-50" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white hover:bg-[#f5f5f5]" : "bg-[#f9f9f9] hover:bg-[#f5f5f5]"}>
                  <td className="py-2.5 px-3 border-r border-b border-[#eee] text-[13px] text-[#333] text-center">
                    {row.uin}
                  </td>
                  <td className="py-2.5 px-3 border-r border-b border-[#eee] text-[13px] text-[#333]">
                    {row.name}
                  </td>
                  <td className="py-2.5 px-3 border-r border-b border-[#eee] text-[13px] text-[#333]">
                    {row.program}
                  </td>
                  <td className="py-2.5 px-3 border-b border-[#eee] text-[13px] text-[#333]">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gradient-to-b from-[#f5f5f5] to-[#d1d1d1] p-2.5 flex justify-center border border-t-0 border-[#ccc]">
          <div className="flex overflow-hidden text-[13px] shadow-sm">
            <button className="px-3 py-1.5 text-[#999] bg-[#f9f9f9] bg-gradient-to-b from-[#fff] to-[#eee] border border-[#ccc] border-r-0 cursor-not-allowed rounded-l-[3px]">First</button>
            <button className="px-3 py-1.5 text-[#999] bg-[#f9f9f9] bg-gradient-to-b from-[#fff] to-[#eee] border border-[#ccc] border-r-0 cursor-not-allowed">&larr; Previous</button>
            <button className="px-3 py-1.5 text-[#333] bg-white border border-[#ccc] border-r-0 hover:bg-[#eee]">1</button>
            <button className="px-3 py-1.5 text-[#333] bg-white border border-[#ccc] border-r-0 hover:bg-[#eee]">2</button>
            <button className="px-3 py-1.5 text-[#333] bg-white border border-[#ccc] border-r-0 hover:bg-[#eee]">3</button>
            <button className="px-3 py-1.5 text-[#333] bg-white border border-[#ccc] border-r-0 hover:bg-[#eee]">4</button>
            <button className="px-3 py-1.5 text-[#333] bg-white border border-[#ccc] border-r-0 hover:bg-[#eee]">5</button>
            <button className="px-3 py-1.5 text-[#333] bg-[#f9f9f9] bg-gradient-to-b from-[#fff] to-[#eee] border border-[#ccc] border-r-0 cursor-pointer hover:bg-[#eee]">Next &rarr;</button>
            <button className="px-3 py-1.5 text-[#337ab7] bg-[#f9f9f9] bg-gradient-to-b from-[#fff] to-[#eee] border border-[#ccc] cursor-pointer hover:bg-[#eee] rounded-r-[3px]">Last</button>
          </div>
        </div>

      </div>

      {/* Manual Stock Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[700px] p-0 border-0 rounded-[5px] overflow-hidden gap-0">
          <div className="bg-[#ff9900] px-4 py-2 flex items-center justify-between">
            <DialogTitle className="text-[14px] font-bold text-[#333]">Manual Stock Details with Adjustment</DialogTitle>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-[#333] hover:text-black bg-white rounded-sm w-4 h-4 flex items-center justify-center text-[10px] font-bold"
            >
              x
            </button>
          </div>
          
          <div className="p-4 bg-white">
            <table className="w-full text-center border border-[#ccc]">
              <thead>
                <tr className="bg-[#f9f9f9]">
                  <th className="py-2 px-3 border-r border-b border-[#ccc] text-[13px] font-bold text-[#333]">
                    Program Name
                  </th>
                  <th className="py-2 px-3 border-r border-b border-[#ccc] text-[13px] font-bold text-[#333]">
                    Admission Count
                  </th>
                  <th className="py-2 px-3 border-r border-b border-[#ccc] text-[13px] font-bold text-[#333]">
                    Ordered Manual Stock (A)
                  </th>
                  <th className="py-2 px-3 border-r border-b border-[#ccc] text-[13px] font-bold text-[#333]">
                    Adjustment against Manual Stock (B)
                  </th>
                  <th className="py-2 px-3 border-b border-[#ccc] text-[13px] font-bold text-[#333]">
                    Remaining Manual Stock (A-B)
                  </th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((row, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-2 px-3 border-r border-b border-[#eee] text-[13px] text-[#333]">
                      {row.program}
                    </td>
                    <td className="py-2 px-3 border-r border-b border-[#eee] text-[13px] text-[#333]">
                      {row.count}
                    </td>
                    <td className="py-2 px-3 border-r border-b border-[#eee] text-[13px] text-[#333]">
                      {row.stockA}
                    </td>
                    <td className="py-2 px-3 border-r border-b border-[#eee] text-[13px] text-[#333]">
                      {row.stockB}
                    </td>
                    <td className="py-2 px-3 border-b border-[#eee] text-[13px] text-[#333]">
                      {row.remaining}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
