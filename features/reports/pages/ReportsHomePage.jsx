'use client';
import Link from 'next/link';
import { ArrowUpRight, BarChart3 } from 'lucide-react';
import { Card,PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import styles from './ReportsHomePage.module.css';
const ITEMS=[['Sales Report','/reports/sales-report','Sales Report'],['Customer Report','/reports/customer-report','Customer Report'],['Product Report','/reports/product-report','Products Report'],['Payment Report','/reports/payment-report','Payment Report'],['Discount Report','/reports/discount-report','Discount Report'],['Supplier Report','/reports/supplier-report','Supplier Report'],['Tax Report','/reports/tax-report','Tax Report'],['Purchase Report','/reports/purchase-report','Purchase Report'],['User Report','/reports/user-report','User Report'],['Stock Report','/reports/stock-report','Stock Report'],['Warehouse Report','/reports/warehouse-report','Warehouse Report'],['Shipping Charge','/reports/shipping-charge','Shipping Charge'],['Expense Report','/reports/expense-report','Expense Report']];
export default function ReportsHomePage(){const {can}=useAuth();return <div className={styles.page}><PageHeader title="Reports" description="Choose a company report to review."/><div className={styles.grid}>{ITEMS.filter(([, ,key])=>can(key)).map(([name,href])=><Link key={href} href={href}><Card><span className={styles.icon}><BarChart3 size={21}/></span><strong>{name}</strong><ArrowUpRight size={18}/></Card></Link>)}</div></div>;}
