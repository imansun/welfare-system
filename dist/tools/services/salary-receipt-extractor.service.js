"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SalaryReceiptExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryReceiptExtractorService = void 0;
const common_1 = require("@nestjs/common");
let SalaryReceiptExtractorService = SalaryReceiptExtractorService_1 = class SalaryReceiptExtractorService {
    logger = new common_1.Logger(SalaryReceiptExtractorService_1.name);
    extract(xmlJson) {
        this.logger.log('Starting extraction process...');
        this.logger.debug(`XML ROOT KEYS: ${xmlJson && typeof xmlJson === 'object'
            ? Object.keys(xmlJson).join(', ')
            : 'root is not object'}`);
        const employeeNodes = this.findEmployeeNodes(xmlJson);
        this.logger.log(`Found ${employeeNodes.length} candidate employee nodes.`);
        const uniqueEmployeeNodes = this.removeDuplicateEmployeeNodes(employeeNodes);
        this.logger.log(`Processing ${uniqueEmployeeNodes.length} unique employees after de-duplication.`);
        const employees = uniqueEmployeeNodes.map((employeeNode, index) => {
            this.logger.debug(`Mapping employee index #${index}`);
            return this.mapEmployee(employeeNode, xmlJson);
        });
        this.logger.log(`Extraction finished. Total employees extracted: ${employees.length}`);
        return { employees };
    }
    findEmployeeNodes(root) {
        this.logger.debug('Searching employee nodes via direct path...');
        const directSalaryReceiptItems = root?.Tablix1?.Details_Collection?.Details?.Column0?.SalaryReceiptItem;
        this.logger.debug(`Direct path type: ${directSalaryReceiptItems
            ? Array.isArray(directSalaryReceiptItems)
                ? 'array'
                : typeof directSalaryReceiptItems
            : 'undefined/null'}`);
        const directItems = this.toArray(directSalaryReceiptItems).filter((item) => this.hasEmployeeIdentity(item));
        if (directItems.length > 0) {
            this.logger.debug(`Found ${directItems.length} employee nodes via direct path.`);
            return directItems;
        }
        this.logger.warn('Direct path for SalaryReceiptItem returned empty, falling back to deep walk search.');
        const result = [];
        const walk = (node, level = 0) => {
            if (!node || typeof node !== 'object') {
                return;
            }
            if (Array.isArray(node)) {
                for (const item of node) {
                    walk(item, level + 1);
                }
                return;
            }
            if (node.SalaryReceiptItem) {
                const salaryReceiptItems = this.toArray(node.SalaryReceiptItem);
                this.logger.debug(`Found SalaryReceiptItem collection at level ${level}, count: ${salaryReceiptItems.length}`);
                for (const item of salaryReceiptItems) {
                    if (this.hasEmployeeIdentity(item)) {
                        result.push(item);
                    }
                }
            }
            for (const value of Object.values(node)) {
                if (value && typeof value === 'object') {
                    walk(value, level + 1);
                }
            }
        };
        walk(root);
        this.logger.log(`Deep walk search found ${result.length} employee candidate nodes.`);
        return result;
    }
    hasEmployeeIdentity(node) {
        if (!node || typeof node !== 'object') {
            return false;
        }
        const rectangle1 = node?.Rectangle1;
        const fullName = this.pickFirst([
            this.getDirectValue(rectangle1, 'FullName'),
            this.getDirectValue(node, 'FullName'),
            this.getValue(node, 'FullName'),
        ]);
        const personnelCode = this.pickFirst([
            this.getDirectValue(rectangle1, 'Code'),
            this.getDirectValue(node, 'Code'),
            this.getValue(node, 'Code'),
        ]);
        const hasId = Boolean(fullName && personnelCode);
        if (!hasId) {
            this.logger.debug(`Skipping node (no identity). Node keys: ${node && typeof node === 'object'
                ? Object.keys(node).join(', ')
                : 'N/A'}`);
        }
        else {
            this.logger.debug(`Candidate employee found. FullName="${fullName}", Code="${personnelCode}"`);
        }
        return hasId;
    }
    removeDuplicateEmployeeNodes(nodes) {
        const seen = new Set();
        const result = [];
        for (const node of nodes) {
            const rectangle1 = node?.Rectangle1;
            const fullName = this.pickFirst([
                this.getDirectValue(rectangle1, 'FullName'),
                this.getDirectValue(node, 'FullName'),
                this.getValue(node, 'FullName'),
            ]);
            const personnelCode = this.pickFirst([
                this.getDirectValue(rectangle1, 'Code'),
                this.getDirectValue(node, 'Code'),
                this.getValue(node, 'Code'),
            ]);
            const key = `${personnelCode ?? ''}::${fullName ?? ''}`;
            if (!seen.has(key)) {
                seen.add(key);
                result.push(node);
            }
            else {
                this.logger.debug(`Duplicate employee node skipped. key="${key}" (FullName="${fullName}", Code="${personnelCode}")`);
            }
        }
        return result;
    }
    mapEmployee(employeeNode, root) {
        const rectangle1 = employeeNode?.Rectangle1;
        const fullName = this.pickFirst([
            this.getDirectValue(rectangle1, 'FullName'),
            this.getDirectValue(employeeNode, 'FullName'),
            this.getValue(employeeNode, 'FullName'),
        ]);
        const personnelCode = this.pickFirst([
            this.getDirectValue(rectangle1, 'Code'),
            this.getDirectValue(employeeNode, 'Code'),
            this.getValue(employeeNode, 'Code'),
            this.getValue(employeeNode, 'PersonnelCode'),
        ]);
        this.logger.debug(`Mapping employee: FullName="${fullName}", Code="${personnelCode}"`);
        const companyName = this.pickFirst([
            this.getDirectValue(rectangle1, 'CompanyName'),
            this.getDirectValue(employeeNode, 'CompanyName'),
            this.getValue(employeeNode, 'CompanyName'),
            this.getValue(root, 'CompanyName'),
            this.getValue(root, 'CompanyTitle'),
            this.getValue(root, 'Title'),
            this.getValue(rectangle1, 'Textbox32'),
            this.getValue(employeeNode, 'Textbox32'),
        ]);
        const year = this.pickFirst([
            this.getDirectValue(rectangle1, 'Year'),
            this.getDirectValue(employeeNode, 'Year'),
            this.getValue(employeeNode, 'Year'),
            this.getValue(root, 'Year'),
            this.getValue(root, 'FiscalYear'),
            this.getDirectValue(rectangle1, 'Textbox46'),
            this.getValue(employeeNode, 'Textbox46'),
        ]);
        const monthTitle = this.pickFirst([
            this.getDirectValue(rectangle1, 'MonthTitle'),
            this.getDirectValue(employeeNode, 'MonthTitle'),
            this.getValue(employeeNode, 'MonthTitle'),
            this.getValue(employeeNode, 'MonthName'),
            this.getValue(root, 'MonthTitle'),
            this.getValue(root, 'MonthName'),
            this.getDirectValue(rectangle1, 'YearMonthTitle'),
            this.getDirectValue(rectangle1, 'Textbox45'),
            this.getValue(employeeNode, 'YearMonthTitle'),
            this.getValue(employeeNode, 'Textbox45'),
        ]);
        const receiptType = this.pickFirst([
            this.getDirectValue(rectangle1, 'ReceiptType'),
            this.getDirectValue(employeeNode, 'ReceiptType'),
            this.getValue(employeeNode, 'ReceiptType'),
            this.getValue(root, 'ReceiptType'),
            this.getValue(root, 'ReportType'),
        ]);
        const organizationUnit = this.pickFirst([
            this.getDirectValue(rectangle1, 'CostCenterFullTitle'),
            this.getDirectValue(employeeNode, 'CostCenterFullTitle'),
            this.getValue(employeeNode, 'CostCenterFullTitle'),
            this.getValue(employeeNode, 'OrganizationUnit'),
            this.getValue(employeeNode, 'Department'),
            this.getValue(employeeNode, 'UnitTitle'),
            this.getDirectValue(rectangle1, 'Textbox35'),
            this.getValue(employeeNode, 'Textbox35'),
        ]);
        const jobTitle = this.pickFirst([
            this.getDirectValue(rectangle1, 'JobTitle'),
            this.getDirectValue(rectangle1, 'PostTitle'),
            this.getDirectValue(rectangle1, 'Textbox10'),
            this.getDirectValue(employeeNode, 'JobTitle'),
            this.getValue(employeeNode, 'JobTitle'),
            this.getValue(employeeNode, 'PostTitle'),
            this.getValue(employeeNode, 'Textbox10'),
        ]);
        const leaveBalance = this.pickFirst([
            this.getDirectValue(rectangle1, 'LeaveBalance'),
            this.getDirectValue(rectangle1, 'Textbox8'),
            this.getDirectValue(employeeNode, 'LeaveBalance'),
            this.getValue(employeeNode, 'LeaveBalance'),
            this.getValue(employeeNode, 'Textbox8'),
        ]);
        const periodTitle = this.pickFirst([
            this.getDirectValue(rectangle1, 'PeriodTitle'),
            this.getDirectValue(employeeNode, 'PeriodTitle'),
            this.getValue(employeeNode, 'PeriodTitle'),
            this.getValue(root, 'PeriodTitle'),
        ]);
        const loans = this.extractLoans(employeeNode);
        const deductions = this.extractDeductions(employeeNode);
        const payments = this.extractPayments(employeeNode);
        const attendance = this.extractAttendance(employeeNode);
        const totalLoanInstallments = this.pickFirst([
            this.getDirectValue(employeeNode, 'TotalLoanInstallments'),
            this.getDirectValue(employeeNode, 'LoanInstallmentsTotal'),
            this.getValue(employeeNode, 'TotalLoanInstallments'),
            this.getValue(employeeNode, 'LoanInstallmentsTotal'),
            this.getValue(employeeNode, 'SumLoanInstallment'),
            this.getValue(employeeNode, 'Textbox20'),
        ]);
        const totalBenefits = this.pickFirst([
            this.getDirectValue(employeeNode, 'TotalBenefits'),
            this.getDirectValue(employeeNode, 'BenefitsTotal'),
            this.getValue(employeeNode, 'TotalBenefits'),
            this.getValue(employeeNode, 'BenefitsTotal'),
            this.getValue(employeeNode, 'SumBenefits'),
            this.getValue(employeeNode, 'Textbox21'),
        ]);
        const totalDeductions = this.pickFirst([
            this.getDirectValue(employeeNode, 'TotalDeductions'),
            this.getDirectValue(employeeNode, 'DeductionsTotal'),
            this.getValue(employeeNode, 'TotalDeductions'),
            this.getValue(employeeNode, 'DeductionsTotal'),
            this.getValue(employeeNode, 'SumDeductions'),
            this.getValue(employeeNode, 'Textbox22'),
        ]);
        const accountNumber = this.pickFirst([
            this.getDirectValue(employeeNode, 'AccountNumber'),
            this.getDirectValue(employeeNode, 'BankAccount'),
            this.getValue(employeeNode, 'AccountNumber'),
            this.getValue(employeeNode, 'BankAccount'),
            this.getValue(employeeNode, 'BankAccountNumber'),
            this.getValue(employeeNode, 'Textbox23'),
        ]);
        const netPayment = this.pickFirst([
            this.getDirectValue(employeeNode, 'NetPayment'),
            this.getDirectValue(employeeNode, 'PayableAmount'),
            this.getDirectValue(employeeNode, 'FinalPayment'),
            this.getValue(employeeNode, 'NetPayment'),
            this.getValue(employeeNode, 'PayableAmount'),
            this.getValue(employeeNode, 'FinalPayment'),
            this.getValue(employeeNode, 'NetPay'),
            this.getValue(employeeNode, 'Textbox24'),
        ]);
        this.logger.debug(`Employee mapped: FullName="${fullName}", Code="${personnelCode}", NetPayment="${netPayment}"`);
        return {
            companyName,
            year,
            monthTitle,
            receiptType,
            fullName,
            personnelCode,
            organizationUnit,
            jobTitle,
            periodTitle,
            leaveBalance,
            loans,
            deductions,
            payments,
            attendance,
            totalLoanInstallments,
            totalBenefits,
            totalDeductions,
            accountNumber,
            netPayment,
        };
    }
    extractLoans(employeeNode) {
        const details4Nodes = this.getDetails4(employeeNode);
        const result = [];
        this.logger.debug(`Extracting loans. Details4 count: ${details4Nodes.length}`);
        for (const details4 of details4Nodes) {
            const loanNodes = this.toArray(details4?.Column0?.SalaryReceiptLoan);
            for (const loanNode of loanNodes) {
                const loanName = this.pickFirst([
                    this.getDirectValue(loanNode, 'Title1'),
                    this.getDirectValue(loanNode, 'LoanName'),
                    this.getDirectValue(loanNode, 'Title'),
                    this.getValue(loanNode, 'Title1'),
                    this.getValue(loanNode, 'LoanName'),
                    this.getValue(loanNode, 'Title'),
                ]);
                const installmentAmount = this.pickFirst([
                    this.getDirectValue(loanNode, 'Amount2'),
                    this.getDirectValue(loanNode, 'InstallmentAmount'),
                    this.getDirectValue(loanNode, 'Amount'),
                    this.getValue(loanNode, 'Amount2'),
                    this.getValue(loanNode, 'InstallmentAmount'),
                    this.getValue(loanNode, 'Amount'),
                ]);
                const remainder = this.pickFirst([
                    this.getDirectValue(loanNode, 'Remainder2'),
                    this.getDirectValue(loanNode, 'Remainder'),
                    this.getDirectValue(loanNode, 'RemainAmount'),
                    this.getValue(loanNode, 'Remainder2'),
                    this.getValue(loanNode, 'Remainder'),
                    this.getValue(loanNode, 'RemainAmount'),
                ]);
                if (loanName || installmentAmount || remainder) {
                    result.push({
                        remainder,
                        installmentAmount,
                        loanName,
                    });
                }
            }
        }
        this.logger.debug(`Loans extracted: ${result.length}`);
        return result;
    }
    extractDeductions(employeeNode) {
        const details4Nodes = this.getDetails4(employeeNode);
        const result = [];
        this.logger.debug(`Extracting deductions. Details4 count: ${details4Nodes.length}`);
        for (const details4 of details4Nodes) {
            const deductionNodes = this.toArray(details4?.Column1?.SalaryReceiptDeduction);
            for (const deductionNode of deductionNodes) {
                const title = this.pickFirst([
                    this.getDirectValue(deductionNode, 'FactorTitle'),
                    this.getDirectValue(deductionNode, 'Title'),
                    this.getDirectValue(deductionNode, 'DeductionTitle'),
                    this.getValue(deductionNode, 'FactorTitle'),
                    this.getValue(deductionNode, 'Title'),
                    this.getValue(deductionNode, 'DeductionTitle'),
                ]);
                const value = this.pickFirst([
                    this.getDirectValue(deductionNode, 'Value'),
                    this.getDirectValue(deductionNode, 'Amount'),
                    this.getDirectValue(deductionNode, 'DeductionValue'),
                    this.getValue(deductionNode, 'Value'),
                    this.getValue(deductionNode, 'Amount'),
                    this.getValue(deductionNode, 'DeductionValue'),
                ]);
                if (title || value) {
                    result.push({
                        value,
                        title,
                    });
                }
            }
        }
        this.logger.debug(`Deductions extracted: ${result.length}`);
        return result;
    }
    extractPayments(employeeNode) {
        const details4Nodes = this.getDetails4(employeeNode);
        const result = [];
        this.logger.debug(`Extracting payments. Details4 count: ${details4Nodes.length}`);
        for (const details4 of details4Nodes) {
            const paymentNodes = this.toArray(details4?.Column2?.SalaryReceiptPayment);
            for (const paymentNode of paymentNodes) {
                const title = this.pickFirst([
                    this.getDirectValue(paymentNode, 'FactorTitle1'),
                    this.getDirectValue(paymentNode, 'FactorTitle'),
                    this.getDirectValue(paymentNode, 'Title'),
                    this.getDirectValue(paymentNode, 'PaymentTitle'),
                    this.getValue(paymentNode, 'FactorTitle1'),
                    this.getValue(paymentNode, 'FactorTitle'),
                    this.getValue(paymentNode, 'Title'),
                    this.getValue(paymentNode, 'PaymentTitle'),
                ]);
                const value = this.pickFirst([
                    this.getDirectValue(paymentNode, 'Value'),
                    this.getDirectValue(paymentNode, 'Amount'),
                    this.getDirectValue(paymentNode, 'PaymentValue'),
                    this.getValue(paymentNode, 'Value'),
                    this.getValue(paymentNode, 'Amount'),
                    this.getValue(paymentNode, 'PaymentValue'),
                ]);
                if (title || value) {
                    result.push({
                        value,
                        title,
                    });
                }
            }
        }
        this.logger.debug(`Payments extracted: ${result.length}`);
        return result;
    }
    extractAttendance(employeeNode) {
        const details4Nodes = this.getDetails4(employeeNode);
        const result = [];
        this.logger.debug(`Extracting attendance. Details4 count: ${details4Nodes.length}`);
        for (const details4 of details4Nodes) {
            const attendanceNodes = this.toArray(details4?.Column3?.SalaryReceiptAttendance);
            for (const attendanceNode of attendanceNodes) {
                const title = this.pickFirst([
                    this.getDirectValue(attendanceNode, 'Title'),
                    this.getDirectValue(attendanceNode, 'AttendanceTitle'),
                    this.getDirectValue(attendanceNode, 'FactorTitle'),
                    this.getValue(attendanceNode, 'Title'),
                    this.getValue(attendanceNode, 'AttendanceTitle'),
                    this.getValue(attendanceNode, 'FactorTitle'),
                ]);
                const value = this.pickFirst([
                    this.getDirectValue(attendanceNode, 'Value'),
                    this.getDirectValue(attendanceNode, 'Amount'),
                    this.getDirectValue(attendanceNode, 'AttendanceValue'),
                    this.getValue(attendanceNode, 'Value'),
                    this.getValue(attendanceNode, 'Amount'),
                    this.getValue(attendanceNode, 'AttendanceValue'),
                ]);
                if (title || value) {
                    result.push({
                        value,
                        title,
                    });
                }
            }
        }
        this.logger.debug(`Attendance extracted: ${result.length}`);
        return result;
    }
    getDetails4(employeeNode) {
        const directDetails4 = employeeNode?.Tablix2?.Details4_Collection?.Details4;
        const directDetails4Array = this.toArray(directDetails4);
        if (directDetails4Array.length > 0) {
            this.logger.debug(`Details4 found via direct path: count=${directDetails4Array.length}`);
            return directDetails4Array;
        }
        this.logger.warn('Details4 direct path empty. Falling back to generic search for "Details4".');
        const fallbackDetails4 = this.getValue(employeeNode, 'Details4');
        const fallbackArray = this.toArray(fallbackDetails4);
        this.logger.debug(`Details4 found via fallback search: count=${fallbackArray.length}`);
        return fallbackArray;
    }
    toArray(value) {
        if (value === null || value === undefined) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }
    pickFirst(values) {
        for (const value of values) {
            const normalized = this.normalizeValue(value);
            if (normalized !== '') {
                return normalized;
            }
        }
        return null;
    }
    getDirectValue(node, key) {
        if (!node || typeof node !== 'object') {
            return undefined;
        }
        if (node[key] !== undefined && node[key] !== null) {
            return node[key];
        }
        if (node.$ && node.$[key] !== undefined && node.$[key] !== null) {
            return node.$[key];
        }
        const fastXmlParserAttributeKey = `@_${key}`;
        if (node[fastXmlParserAttributeKey] !== undefined &&
            node[fastXmlParserAttributeKey] !== null) {
            return node[fastXmlParserAttributeKey];
        }
        if (node.attributes &&
            node.attributes[key] !== undefined &&
            node.attributes[key] !== null) {
            return node.attributes[key];
        }
        if (node.attrs &&
            node.attrs[key] !== undefined &&
            node.attrs[key] !== null) {
            return node.attrs[key];
        }
        return undefined;
    }
    getValue(node, key) {
        if (!node || typeof node !== 'object') {
            return undefined;
        }
        const direct = this.getDirectValue(node, key);
        if (direct !== undefined && direct !== null) {
            return direct;
        }
        if (Array.isArray(node)) {
            for (const item of node) {
                const found = this.getValue(item, key);
                if (found !== undefined && found !== null) {
                    return found;
                }
            }
            return undefined;
        }
        for (const value of Object.values(node)) {
            if (!value || typeof value !== 'object') {
                continue;
            }
            const found = this.getValue(value, key);
            if (found !== undefined && found !== null) {
                return found;
            }
        }
        return undefined;
    }
    normalizeValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            return value.trim();
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value).trim();
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                const normalized = this.normalizeValue(item);
                if (normalized !== '') {
                    return normalized;
                }
            }
            return '';
        }
        if (typeof value === 'object') {
            const possibleTextValues = [
                value.text,
                value._,
                value.__text,
                value['#text'],
                value.value,
            ];
            for (const possibleTextValue of possibleTextValues) {
                const normalized = this.normalizeValue(possibleTextValue);
                if (normalized !== '') {
                    return normalized;
                }
            }
            return '';
        }
        return String(value).trim();
    }
};
exports.SalaryReceiptExtractorService = SalaryReceiptExtractorService;
exports.SalaryReceiptExtractorService = SalaryReceiptExtractorService = SalaryReceiptExtractorService_1 = __decorate([
    (0, common_1.Injectable)()
], SalaryReceiptExtractorService);
//# sourceMappingURL=salary-receipt-extractor.service.js.map