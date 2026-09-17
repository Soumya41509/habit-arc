import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = SQLite.openDatabaseSync('routiva.db');
    }
    return dbInstance;
}

export async function initDatabase() {
    try {
        const db = getDb();
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS habits (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                icon TEXT DEFAULT 'star',
                color TEXT DEFAULT '#6366F1',
                frequency TEXT DEFAULT '["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]',
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS habit_logs (
                id TEXT PRIMARY KEY,
                habit_id TEXT NOT NULL,
                completed_at TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
                UNIQUE(habit_id, completed_at)
            );
        `);

        // Migration from legacy database if applicable
        try {
            const count = await db.getFirstAsync('SELECT COUNT(*) as c FROM habits');
            if (count?.c === 0) {
                const oldDb = SQLite.openDatabaseSync('habitarc.db');
                const oldHabits = await oldDb.getAllAsync('SELECT * FROM habits');
                if (oldHabits && oldHabits.length > 0) {
                    for (const h of oldHabits) {
                        await db.runAsync(
                            'INSERT OR IGNORE INTO habits (id, title, icon, color, frequency, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                            [h.id, h.title, h.icon, h.color, h.frequency, h.created_at]
                        );
                    }
                    const oldLogs = await oldDb.getAllAsync('SELECT * FROM habit_logs');
                    if (oldLogs && oldLogs.length > 0) {
                        for (const l of oldLogs) {
                            await db.runAsync(
                                'INSERT OR IGNORE INTO habit_logs (id, habit_id, completed_at, created_at) VALUES (?, ?, ?, ?)',
                                [l.id, l.habit_id, l.completed_at, l.created_at]
                            );
                        }
                    }
                }
            }
        } catch (migErr) {
            // No legacy database to migrate from
        }
    } catch (e) {
        console.error('Failed to initialize local database:', e);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export async function getHabitsWithTodayStatus(todayDateStr) {
    await initDatabase();
    const db = getDb();
    
    const habits = await db.getAllAsync('SELECT * FROM habits ORDER BY created_at DESC');
    const logs = await db.getAllAsync('SELECT habit_id FROM habit_logs WHERE completed_at = ?', [todayDateStr]);
    
    const completedSet = new Set(logs.map(l => l.habit_id));
    
    return habits.map(h => ({
        ...h,
        frequency: typeof h.frequency === 'string' ? JSON.parse(h.frequency) : h.frequency,
        completed: completedSet.has(h.id),
    }));
}

export async function addHabit({ title, icon = 'star', color = '#6366F1', frequency = [] }) {
    await initDatabase();
    const db = getDb();
    const id = generateId();
    const freqJson = JSON.stringify(frequency);
    
    await db.runAsync(
        'INSERT INTO habits (id, title, icon, color, frequency) VALUES (?, ?, ?, ?, ?)',
        [id, title, icon, color, freqJson]
    );
    return { id, title, icon, color, frequency };
}

export async function toggleHabitCompletion(habitId, completedAt, currentlyCompleted) {
    await initDatabase();
    const db = getDb();
    
    if (currentlyCompleted) {
        await db.runAsync(
            'DELETE FROM habit_logs WHERE habit_id = ? AND completed_at = ?',
            [habitId, completedAt]
        );
        return false;
    } else {
        const id = generateId();
        await db.runAsync(
            'INSERT OR IGNORE INTO habit_logs (id, habit_id, completed_at) VALUES (?, ?, ?)',
            [id, habitId, completedAt]
        );
        return true;
    }
}

export async function getHabitDetails(habitId) {
    await initDatabase();
    const db = getDb();
    
    const habit = await db.getFirstAsync('SELECT * FROM habits WHERE id = ?', [habitId]);
    if (!habit) return null;
    
    const countResult = await db.getFirstAsync(
        'SELECT COUNT(*) as total FROM habit_logs WHERE habit_id = ?',
        [habitId]
    );
    
    return {
        ...habit,
        frequency: typeof habit.frequency === 'string' ? JSON.parse(habit.frequency) : habit.frequency,
        totalCompletions: countResult?.total || 0,
    };
}

export async function deleteHabit(habitId) {
    await initDatabase();
    const db = getDb();
    await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?', [habitId]);
    await db.runAsync('DELETE FROM habits WHERE id = ?', [habitId]);
}

export async function getWeeklyLogs(startDateStr, endDateStr) {
    await initDatabase();
    const db = getDb();
    const logs = await db.getAllAsync(
        'SELECT completed_at FROM habit_logs WHERE completed_at >= ? AND completed_at <= ?',
        [startDateStr, endDateStr]
    );
    return logs || [];
}
