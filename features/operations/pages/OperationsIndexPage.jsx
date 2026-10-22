'use client';

import { EntityManager } from '../components';
import styles from './OperationsIndexPage.module.css';

const configs = {
  customers: { title: 'Customer List', label: 'Customer', api: '/api/customers', description: 'Manage customer contacts and account details.', modalCreate: true, fields: [{key:'name',label:'Name',required:true},{key:'phone',label:'Phone',type:'tel'},{key:'email',label:'Email',type:'email'},{key:'customerGroup',label:'Customer group',default:'General'},{key:'rewardPoints',label:'Reward points',type:'number',default:'0'},{key:'address',label:'Address'}], toPayload: (v) => ({...v, rewardPoints: v.rewardPoints === '' ? null : Number(v.rewardPoints)}), columns: [{key:'name',label:'Name'},{key:'phone',label:'Phone'},{key:'email',label:'Email'},{key:'customerGroup',label:'Group'},{key:'rewardPoints',label:'Reward points'},{key:'address',label:'Address'}] },
  suppliers: { title: 'Supplier List', label: 'Supplier', api: '/api/suppliers', description: 'Manage supplier contacts and company details.', modalCreate: true, fields: [{key:'name',label:'Name',required:true},{key:'phone',label:'Phone'},{key:'email',label:'Email',type:'email'},{key:'country',label:'Country'},{key:'city',label:'City'},{key:'address',label:'Address'},{key:'zipCode',label:'Zip code'},{key:'company',label:'Company'},{key:'supplierCode',label:'Supplier code'}], columns: [{key:'name',label:'Name'},{key:'phone',label:'Phone'},{key:'email',label:'Email'},{key:'company',label:'Company'},{key:'supplierCode',label:'Supplier code'},{key:'address',label:'Address'}] },
  billers: { title: 'Biller List', label: 'Biller', api: '/api/billers', description: 'Manage billers assigned to your warehouses.', modalCreate: true, fields: [{key:'name',label:'Name',required:true},{key:'dateOfJoin',label:'Date of join',type:'date'},{key:'phone',label:'Phone'},{key:'email',label:'Email',type:'email'},{key:'nidPassport',label:'NID or passport'},{key:'address',label:'Address'},{key:'zipCode',label:'Zip code'},{key:'billerCode',label:'Biller code'}], columns: [{key:'name',label:'Name'},{key:'phone',label:'Phone'},{key:'email',label:'Email'},{key:'billerCode',label:'Biller code'},{key:'address',label:'Address'}] },
  warehouses: { title: 'Warehouses', label: 'Warehouse', api: '/api/warehouses', description: 'Manage locations used to track stock.', modalCreate: true, fields: [{key:'name',label:'Name',required:true},{key:'phone',label:'Phone'},{key:'email',label:'Email',type:'email'},{key:'address',label:'Address',type:'textarea'}], columns: [{key:'name',label:'Warehouse'},{key:'phone',label:'Phone'},{key:'email',label:'Email'},{key:'address',label:'Address'}] },
  expenseCategories: { title: 'Expense Categories', label: 'Category', api: '/api/expense-categories', description: 'Organize direct and indirect expenses.', modalCreate: true, importFields: [{field:'name',label:'Category',required:true},{field:'subCategory',label:'Subcategory'}], importAccept: '.csv,text/csv', showCsvExport: true, fields: [{key:'name',label:'Category',required:true},{key:'subCategory',label:'Subcategory'}], columns: [{key:'name',label:'Category'},{key:'subCategory',label:'Subcategory'}] },
};

export default function OperationsIndexPage({ kind }) {
  const config = configs[kind];
  if (!config) return null;
  return <div className={styles.page}><EntityManager config={config}/></div>;
}
