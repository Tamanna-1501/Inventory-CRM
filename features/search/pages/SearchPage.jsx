'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react';
import { Button, Card, Input, PageHeader, Select, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useGlobalSearch } from '@/features/search/hooks/useGlobalSearch';
import styles from './SearchPage.module.css';

const SOURCES = [
  ['products', 'prod', 'view'], ['sales', 'sales', 'view'], ['purchases', 'purchase', 'view'],
  ['customers', 'customer', 'view'], ['suppliers', 'supplier', 'view'], ['expenses', 'expense', 'view'],
  ['warehouses', 'wh', 'view'], ['transfers', 'transfer', 'view'], ['users', 'user', 'view'],
];

export default function SearchPage() {
  const { can, user } = useAuth();
  const { loading, results, errors, searched, search, cancel } = useGlobalSearch();
  const [query, setQuery] = useState('');
  const [sourceType, setSourceType] = useState('all');
  const inputRef = useRef(null);
  const allowedTypes = useMemo(() => SOURCES.filter(([, key, action]) => can(key, action)).map(([type]) => type), [can, user?.id, user?.isAdmin, user?.permissions]);
  const grouped = useMemo(() => results.reduce((groups, result) => {
    (groups[result.typeLabel] ||= []).push(result);
    return groups;
  }, {}), [results]);

  useEffect(() => {
    inputRef.current?.focus();
    return cancel;
  }, [cancel]);

  function submit(event) {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2 || !allowedTypes.length) return;
    search(term, sourceType === 'all' ? allowedTypes : allowedTypes.includes(sourceType) ? [sourceType] : []);
  }

  return <main className={styles.page}>
    <PageHeader title="Search" description="Find records in the parts of Inventual you can access." />
    <Card className={styles.searchCard}>
      <form className={styles.form} onSubmit={submit} role="search">
        <label className={styles.searchInput} htmlFor="global-search-query"><SearchIcon size={20} aria-hidden="true" /><Input ref={inputRef} id="global-search-query" type="search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, sales, customers, and more" minLength={2} /></label>
        <Select aria-label="Search in" value={sourceType} onChange={(event) => setSourceType(event.target.value)}><option value="all">All accessible areas</option>{SOURCES.filter(([type]) => allowedTypes.includes(type)).map(([type, , , label]) => <option value={type} key={type}>{label || type[0].toUpperCase() + type.slice(1)}</option>)}</Select>
        <Button type="submit" leadingIcon={<SearchIcon size={17} />} loading={loading} disabled={query.trim().length < 2 || !allowedTypes.length}>Search</Button>
      </form>
      <p className={styles.hint}>Enter at least 2 characters. Results are limited to records your role can view.</p>
    </Card>

    {errors.length > 0 && <Card className={styles.errorCard}><h2>Some records could not be searched</h2><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></Card>}
    {loading && <div className={styles.loading}><Spinner label="Searching company records" /></div>}
    {!loading && searched && results.length === 0 && errors.length === 0 && <Card className={styles.empty}><SearchIcon size={24} /><h2>No matches found</h2><p>Try another name, reference, email, SKU, or phone number.</p></Card>}
    {!loading && results.length > 0 && <section className={styles.results} aria-live="polite" aria-label={`${results.length} search results`}>
      <div className={styles.resultsHeading}><h2>Search results</h2><span>{results.length} matching records</span></div>
      {Object.entries(grouped).map(([group, rows]) => <Card key={group} title={group} className={styles.group}>
        <ul className={styles.resultList}>{rows.map((result) => <li key={result.id}>
          <Link className={styles.result} href={result.href}>
            <span className={styles.resultCopy}><strong>{result.title}</strong><span>{result.detail || result.typeLabel}</span>{result.date && <time dateTime={result.date}>{new Date(result.date).toLocaleDateString()}</time>}</span>
            <span className={styles.resultType}>{result.typeLabel}</span><ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </li>)}</ul>
      </Card>)}
    </section>}
  </main>;
}
