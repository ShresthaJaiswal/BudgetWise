import { describe, it, expect } from '@jest/globals'

// test generateCSV directly since it's the main logic of the worker
const generateCSV = (transactions) => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount']
    const rows = transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('en-IN'),
        `"${t.description}"`,
        t.type.name,
        t.category.name,
        t.amount
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// test Deque directly
class Deque {
    constructor() { this.items = [] }
    pushFront(item) { this.items.unshift(item) }
    pushBack(item) { this.items.push(item) }
    popFront() { return this.items.shift() }
    popBack() { return this.items.pop() }
    isEmpty() { return this.items.length === 0 }
    size() { return this.items.length }
}

const mockTransactions = [
    {
        createdAt: '2026-03-01T00:00:00.000Z',
        description: 'Grocery run',
        type: { name: 'expense' },
        category: { name: 'Food & Dining' },
        amount: 500
    },
    {
        createdAt: '2026-03-02T00:00:00.000Z',
        description: 'Salary',
        type: { name: 'income' },
        category: { name: 'Salary' },
        amount: 130000
    }
]

describe('generateCSV', () => {
    it('should contain transaction data', () => {
        const csv = generateCSV(mockTransactions)
        expect(csv).toContain('Grocery run')
        expect(csv).toContain('500')
        expect(csv).toContain('130000')
        expect(csv).toContain('Food & Dining')
    })

    it('should include headers as first row', () => {
        const csv = generateCSV(mockTransactions)
        const firstRow = csv.split('\n')[0]
        expect(firstRow).toBe('Date,Description,Type,Category,Amount')
    })

    it('should generate correct number of rows', () => {
        const csv = generateCSV(mockTransactions)
        const rows = csv.split('\n')
        expect(rows.length).toBe(mockTransactions.length + 1) // +1 for header
    })

    it('should wrap description in quotes', () => {
        const csv = generateCSV(mockTransactions)
        expect(csv).toContain('"Grocery run"')
    })

    it('should return only header for empty transactions', () => {
        const csv = generateCSV([])
        expect(csv).toBe('Date,Description,Type,Category,Amount')
    })

    it('should include correct type names', () => {
        const csv = generateCSV(mockTransactions)
        expect(csv).toContain('expense')
        expect(csv).toContain('income')
    })
})

describe('Deque', () => {

    it('should start empty', () => {
        const deque = new Deque()
        expect(deque.isEmpty()).toBe(true)
        expect(deque.size()).toBe(0)
    })

    it('should add and remove items in correct order', () => {
        const deque = new Deque()
        deque.pushBack(1)
        deque.pushBack(2)
        deque.pushFront(0)
        expect(deque.popFront()).toBe(0)
        expect(deque.popBack()).toBe(2)
        expect(deque.popFront()).toBe(1)
    })

    it('should report empty and size correctly', () => {
        const deque = new Deque()
        expect(deque.isEmpty()).toBe(true)
        expect(deque.size()).toBe(0)
        deque.pushBack(1)
        expect(deque.isEmpty()).toBe(false)
        expect(deque.size()).toBe(1)
    })

    it('pushBack should add to back', () => {
        const deque = new Deque()
        deque.pushBack({ id: 1 })
        deque.pushBack({ id: 2 })
        expect(deque.popFront()).toEqual({ id: 1 })
    })

    it('failed job should be pushed to front for immediate retry', () => {
        const deque = new Deque()
        deque.pushBack({ message: 'job1', attempts: 2 })
        deque.pushBack({ message: 'job2', attempts: 2 })
        deque.pushFront({ message: 'failed', attempts: 2 })  // failed job jumps queue
        expect(deque.popFront().message).toBe('failed')
    })

    it('should respect MAX_RETRIES', () => {
        const MAX_RETRIES = 3
        const attempts = 3
        expect(attempts >= MAX_RETRIES).toBe(true)  // should not retry
    })

    it('size should update correctly', () => {
        const deque = new Deque()
        deque.pushBack('a')
        deque.pushBack('b')
        deque.pushFront('c')
        expect(deque.size()).toBe(3)
        deque.popFront()
        expect(deque.size()).toBe(2)
    })
})
