import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Attendance, Due, Member } from '@/types/library';

export const generateAttendanceReport = (
  attendance: Attendance[],
  title: string,
  format: 'pdf' | 'excel'
) => {
  const data = attendance.map((att) => ({
    'Member Name': att.memberName,
    'Date': new Date(att.date).toLocaleDateString('en-IN'),
    'Entry Time': new Date(att.entryTime).toLocaleTimeString('en-IN'),
    'Exit Time': att.exitTime ? new Date(att.exitTime).toLocaleTimeString('en-IN') : 'Still Present',
    'Status': att.status === 'present' ? 'Present' : 'Left',
  }));

  if (format === 'pdf') {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(139, 69, 19);
    doc.text('Shri Hanumant Library', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(title, 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 32, { align: 'center' });

    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map(Object.values),
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [139, 69, 19] },
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  } else {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
  }
};

export const generateDuesReport = (
  dues: Due[],
  title: string,
  format: 'pdf' | 'excel'
) => {
  const data = dues.map((due) => ({
    'Member Name': due.memberName,
    'Amount': `₹${due.amount}`,
    'Period': due.period,
    'Due Date': new Date(due.dueDate).toLocaleDateString('en-IN'),
    'Paid Date': due.paidDate ? new Date(due.paidDate).toLocaleDateString('en-IN') : '-',
    'Status': due.status === 'paid' ? 'Paid' : 'Pending',
  }));

  if (format === 'pdf') {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(139, 69, 19);
    doc.text('Shri Hanumant Library', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(title, 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 32, { align: 'center' });

    const totalPending = dues.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
    const totalPaid = dues.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
    
    doc.text(`Total Pending: ₹${totalPending} | Total Collected: ₹${totalPaid}`, 105, 38, { align: 'center' });

    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map(Object.values),
      startY: 45,
      theme: 'striped',
      headStyles: { fillColor: [139, 69, 19] },
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  } else {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dues');
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
  }
};

export const generateReceipt = (
  member: Member,
  due: Due
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210], // A5 size
  });

  // Border
  doc.setDrawColor(139, 69, 19);
  doc.setLineWidth(1);
  doc.rect(5, 5, 138, 200);
  doc.rect(7, 7, 134, 196);

  // Header
  doc.setFontSize(20);
  doc.setTextColor(139, 69, 19);
  doc.text('Shri Hanumant Library', 74, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('PAYMENT RECEIPT', 74, 35, { align: 'center' });

  // Receipt details
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  const startY = 50;
  const lineHeight = 8;

  doc.text(`Receipt No: ${due.id.slice(-8).toUpperCase()}`, 15, startY);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 15, startY + lineHeight);
  
  doc.line(15, startY + lineHeight * 2, 133, startY + lineHeight * 2);

  doc.text(`Member Name: ${member.name}`, 15, startY + lineHeight * 3);
  doc.text(`Member ID: ${member.id}`, 15, startY + lineHeight * 4);
  doc.text(`Seat Number: ${member.seatNumber}`, 15, startY + lineHeight * 5);

  doc.line(15, startY + lineHeight * 6, 133, startY + lineHeight * 6);

  doc.text(`Period: ${due.period}`, 15, startY + lineHeight * 7);
  doc.text(`Amount Paid: ₹${due.amount}`, 15, startY + lineHeight * 8);
  doc.text(`Payment Date: ${due.paidDate ? new Date(due.paidDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}`, 15, startY + lineHeight * 9);

  doc.line(15, startY + lineHeight * 10, 133, startY + lineHeight * 10);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Thank you for your payment!', 74, startY + lineHeight * 12, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text('74XH+3HW, Ramuvapur, Mahmudabad, UP 261203', 74, 180, { align: 'center' });
  doc.text('Contact: +91 79913 04874', 74, 185, { align: 'center' });

  doc.save(`Receipt_${member.name.replace(/\s+/g, '_')}_${due.period.replace(/\s+/g, '_')}.pdf`);
};

export const generateMemberReport = (
  members: Member[],
  title: string,
  format: 'pdf' | 'excel'
) => {
  const data = members.map((member) => ({
    'Name': member.name,
    'Email': member.email,
    'Phone': member.phone,
    'Seat': member.seatNumber,
    'Monthly Fee': `₹${member.monthlyFee}`,
    'Join Date': new Date(member.joinDate).toLocaleDateString('en-IN'),
    'Status': member.status === 'active' ? 'Active' : 'Inactive',
  }));

  if (format === 'pdf') {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.setTextColor(139, 69, 19);
    doc.text('Shri Hanumant Library', 148, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(title, 148, 25, { align: 'center' });

    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map(Object.values),
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [139, 69, 19] },
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  } else {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
  }
};
