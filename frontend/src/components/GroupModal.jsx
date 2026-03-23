// opens when you click a GroupCard shows transactions inside the group contains the picker

import { useState } from 'react'
import TransactionPicker from './TransactionPicker'
import { useCreateGroupMutation, useRenameGroupMutation, useAddTransactionToGroupMutation, useRemoveTransactionFromGroupMutation, useDeleteGroupMutation } from '../store/api'
import ConfirmDialog from './ConfirmDialog'
import { useGetGroupsQuery } from '../store/api'

export default function GroupModal({ group, onClose, allTransactions, addToast }) {
    // add state for tracking newly created group id
    const [createdGroupId, setCreatedGroupId] = useState(null)
    // treat as edit mode once created
    const isNew = group.isNew && !createdGroupId
    const [name, setName] = useState(isNew ? '' : group.name)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [error, setError] = useState('')
    const [closeConfirm, setCloseConfirm] = useState(false) // for unsaved changes

    // staged changes — not sent to DB until Save
    const [stagedAdd, setStagedAdd] = useState([])       // transaction objects to add
    const [stagedRemove, setStagedRemove] = useState([]) // transaction ids to remove

    const { data: groups = [] } = useGetGroupsQuery()
    const [createGroup] = useCreateGroupMutation()
    const [renameGroup] = useRenameGroupMutation()
    const [deleteGroup] = useDeleteGroupMutation()
    const [addTransactionToGroup] = useAddTransactionToGroupMutation()
    const [removeTransactionFromGroup] = useRemoveTransactionFromGroupMutation()

    const liveGroup = createdGroupId
        ? groups.find(g => g.id === createdGroupId) || group // newly created
        : groups.find(g => g.id === group.id) || group // existing

    if (createdGroupId && !liveGroup) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="card p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            </div>
        )
    }

    // compute display list from live + staged
    const linkedTransactions = [
        ...(liveGroup.transactions?.map(gt => gt.transaction) || [])
            .filter(t => !stagedRemove.includes(t.id)),  // hide staged removals
        ...stagedAdd  // show staged additions
    ]

    const linkedIds = linkedTransactions.map(t => t.id)

    const originalName = isNew ? '' : group.name
    const hasChanges = name !== originalName || stagedAdd.length > 0 || stagedRemove.length > 0 // drives the close/cross button behavior

    // stage add (no DB call yet)
    const handleStageAdd = (t) => {
        if (linkedIds.includes(t.id)) {
            // if it was staged for add, unstage it
            setStagedAdd(prev => prev.filter(s => s.id !== t.id))
        } else {
            setStagedAdd(prev => [...prev, t])
        }
    }

    const handleStageRemove = (txnId) => {
        const isAlreadyLinked = liveGroup.transactions?.some(gt => gt.transaction.id === txnId)
        if (isAlreadyLinked) {
            setStagedRemove(prev => [...prev, txnId])
        } else {
            // was only staged for add — just unstage it
            setStagedAdd(prev => prev.filter(s => s.id !== txnId))
        }
    }

    // fire all staged mutations
    const handleSave = async () => {
        if (!name.trim()) return setError('Group name cannot be empty')

        try {
            if (isNew) {
                const newGroup = await createGroup({ name }).unwrap()
                addToast('Group created', 'success')
                // onClose()
                setCreatedGroupId(newGroup.id) // // stay open, switch to edit mode
                setPickerOpen(true)
                return
            }

            if (name !== originalName) {
                await renameGroup({ id: liveGroup.id, name }).unwrap()
            }

            await Promise.all(
                stagedAdd.map(t => addTransactionToGroup({ groupId: liveGroup.id, transaction_id: t.id }).unwrap())
            )

            await Promise.all(
                stagedRemove.map(txnId => removeTransactionFromGroup({ groupId: liveGroup.id, txnId }).unwrap())
            )

            addToast('Changes made to group saved', 'success')
            onClose()
        } catch (err) {
            setError(err.data?.message || 'Something went wrong')
            addToast('Failed to save group', 'error')
        }
    }

    // checks for unsaved changes
    const handleClose = () => {
        if (hasChanges) {
            // if (ConfirmDialog.confirm('You have unsaved changes. Close without saving?')) {
            //     onClose()
            // }

            // ConfirmDialog is a React component, not a class with a static method. You can't call it like a function. You need to manage it with state, same pattern as Dashboard
            setCloseConfirm(true)
        } else {
            onClose()
        }
    }

    const handleDelete = async () => {
        try {
            await deleteGroup(liveGroup.id).unwrap()
            addToast('Group deleted', 'success')
            onClose()
        } catch {
            addToast('Failed to delete group', 'error')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <div className="card w-full max-w-lg max-h-[85vh] flex flex-col p-6">

                {/* header — cross uses handleClose */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100">
                        {isNew ? 'New group' : 'Edit group'}
                    </h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
                </div>

                <input
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    placeholder="Group name"
                    className="input mb-1 p-2 text-gray-950 font-semibold text-lg rounded-xl bg-slate-200 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                />
                {error && <p className="text-xs text-rose-500 mb-3">{error}</p>}

                {!isNew && (
                    <div className="flex-1 overflow-y-auto my-4 space-y-2">
                        {linkedTransactions.length === 0
                            ? <p className="text-sm text-slate-400 text-center py-4">No transactions yet</p>
                            : linkedTransactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.description}</p>
                                        <p className="text-xs text-slate-400">{t.category.name} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-medium ${t.type.name === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {t.type.name === 'income' ? '+' : '-'}₹{t.amount}
                                        </span>
                                        <button onClick={() => handleStageRemove(t.id)} className="text-xs text-rose-400 hover:text-rose-600">✕</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}

                {!isNew && (
                    pickerOpen
                        ? <TransactionPicker
                            allTransactions={allTransactions}
                            linkedIds={linkedIds}           // ← staged-aware
                            onToggle={handleStageAdd}       // ← stage only, no DB call
                            onClose={() => setPickerOpen(false)}
                        />
                        : <button onClick={() => setPickerOpen(true)} className="text-sm text-emerald-500 hover:text-emerald-600 mb-4 text-left">
                            + Add transactions
                        </button>
                )}

                <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    {!isNew && (
                        <button onClick={handleDelete} className="text-sm px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                            Delete group
                        </button>
                    )}
                    {/* Cancel — just closes, no confirm needed since nothing is saved yet */}
                    <button onClick={onClose} className="ml-auto text-sm px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="text-sm px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                        {isNew ? 'Create' : 'Save'}
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={closeConfirm}
                message="You have unsaved changes. Close without saving?"
                onConfirm={onClose}
                onCancel={() => setCloseConfirm(false)}
            />
        </div>
    )
}

// User clicks group
//         ↓
// setSelectedGroup(group)
//         ↓
// selectedGroup exists
//         ↓
// GroupModal renders
//         ↓
// User clicks close
//         ↓
// setSelectedGroup(null)
//         ↓
// Modal disappears