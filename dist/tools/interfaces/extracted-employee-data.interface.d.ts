export interface SalaryReceiptLoan {
    remainder: string | null;
    installmentAmount: string | null;
    loanName: string | null;
}
export interface SalaryReceiptDeduction {
    value: string | null;
    title: string | null;
}
export interface SalaryReceiptPayment {
    value: string | null;
    title: string | null;
}
export interface SalaryReceiptAttendance {
    value: string | null;
    title: string | null;
}
export interface ExtractedEmployeeData {
    companyName: string | null;
    year: string | null;
    monthTitle: string | null;
    receiptType: string | null;
    fullName: string | null;
    personnelCode: string | null;
    organizationUnit: string | null;
    jobTitle: string | null;
    periodTitle: string | null;
    leaveBalance: string | null;
    loans: SalaryReceiptLoan[];
    deductions: SalaryReceiptDeduction[];
    payments: SalaryReceiptPayment[];
    attendance: SalaryReceiptAttendance[];
    totalLoanInstallments: string | null;
    totalBenefits: string | null;
    totalDeductions: string | null;
    accountNumber: string | null;
    netPayment: string | null;
}
