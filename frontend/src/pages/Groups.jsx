import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import { useGetGroupsQuery, useGetTransactionQuery } from '../store/api'
import GroupModal from '../components/GroupModal'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'

export default function Groups() {
    const user = useSelector(state => state.auth.user)
    const { data: groups, isLoading } = useGetGroupsQuery()
    const { data: transactions = [] } = useGetTransactionQuery(undefined, { skip: !user })
    const { toasts, addToast, removeToast } = useToast()
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [search, setSearch] = useState('')

    const filtered = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

            {/* header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100">
                        My Groups
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">{groups.length} group{groups.length !== 1 ? 's' : ''} total</p>
                </div>
                <button
                    onClick={() => setSelectedGroup({ isNew: true })}
                    className="btn-primary text-sm">
                    + New Group
                </button>
            </div>

            {/* search */}
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search groups..."
                className="input-field mb-6"
            />

            {/* empty state */}
            {groups.length === 0 ? (
                <div className="card p-12 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 text-sm mb-4">No groups yet</p>
                    <button
                        onClick={() => setSelectedGroup({ isNew: true })}
                        className="btn-primary text-sm">
                        Create your first group
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No groups match your search</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(g => (
                        <div
                            key={g.id}
                            onClick={() => setSelectedGroup(g)}
                            className="card p-4 cursor-pointer hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <p className="font-display font-semibold text-slate-800 dark:text-slate-100 truncate pr-2">
                                    {g.name}
                                </p>
                                <span className="text-xs text-slate-400 shrink-0">✎ edit</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">
                                {g._count.transactions} transaction{g._count.transactions !== 1 ? 's' : ''}
                            </p>
                            <p className={`text-lg font-bold ${g.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {g.net >= 0 ? '+' : ''}Rs.{Math.abs(g.net).toLocaleString('en-IN')}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* GroupModal — same component as Dashboard */}
            {selectedGroup && (
                <GroupModal
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    allTransactions={transactions}
                    addToast={addToast}
                />
            )}

            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}
