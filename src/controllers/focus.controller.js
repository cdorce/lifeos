import { sequelize } from '../config/database.js';

class FocusController {
  // Get all focus sessions
  async getAllSessions(req, res) {
    try {
      const { date, type } = req.query;
      
      let query = 'SELECT * FROM focus_sessions WHERE user_id = ?';
      const params = [req.user.id];

      if (date) {
        query += ' AND DATE(start_time) = ?';
        params.push(date);
      }

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      query += ' ORDER BY start_time DESC';

      const [sessions] = await sequelize.query(query, {
        replacements: params
      });

      res.json({
        status: 'success',
        count: sessions.length,
        sessions: sessions
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Get session stats
  async getSessionStats(req, res) {
    try {
      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(*) as totalSessions,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedSessions,
          SUM(duration) as totalMinutes,
          AVG(duration) as avgDuration,
          COUNT(DISTINCT DATE(start_time)) as totalDays
        FROM focus_sessions
        WHERE user_id = ?
      `, {
        replacements: [req.user.id]
      });

      // Get today's stats
      const [todayStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as todaySessions,
          SUM(duration) as todayMinutes
        FROM focus_sessions
        WHERE user_id = ? AND DATE(start_time) = CURDATE()
      `, {
        replacements: [req.user.id]
      });

      const result = {
        ...(stats[0] || { totalSessions: 0, completedSessions: 0, totalMinutes: 0, avgDuration: 0, totalDays: 0 }),
        ...(todayStats[0] || { todaySessions: 0, todayMinutes: 0 })
      };

      res.json({
        status: 'success',
        stats: result
      });
    } catch (error) {
      console.error('Get session stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Get today's sessions
  async getTodaySessions(req, res) {
    try {
      const [sessions] = await sequelize.query(
        `SELECT * FROM focus_sessions 
         WHERE user_id = ? AND DATE(start_time) = CURDATE()
         ORDER BY start_time DESC`,
        {
          replacements: [req.user.id]
        }
      );

      res.json({
        status: 'success',
        count: sessions.length,
        sessions: sessions
      });
    } catch (error) {
      console.error('Get today sessions error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Get single session
  async getSessionById(req, res) {
    try {
      const [sessions] = await sequelize.query(
        'SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (sessions.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Session not found'
        });
      }

      res.json({
        status: 'success',
        session: sessions[0]
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

// Create session
    async createSession(req, res) {
    try {
        const { type, duration, start_time, end_time, completed, notes } = req.body;

        console.log('Creating session with data:', req.body); // Debug log

        if (!type || !duration || !start_time) {
        return res.status(400).json({
            status: 'error',
            message: 'Type, duration, and start time are required'
        });
        }

        // Get the last inserted ID
        const [[{ id: insertedId }]] = await sequelize.query(
        'SELECT LAST_INSERT_ID() as id'
        );

        // Fetch the newly created session
        const [newSession] = await sequelize.query(
        'SELECT * FROM focus_sessions WHERE id = ?',
        {
            replacements: [insertedId]
        }
        );

        console.log('Created session:', newSession[0]); // Debug log

        res.status(201).json({
        status: 'success',
        session: newSession[0]
        });
    } catch (error) {
        console.error('Create session error:', error);
        console.error('Error stack:', error.stack); // More detailed error
        res.status(500).json({
        status: 'error',
        message: 'Server error',
        error: error.message // Send error details in development
        });
    }
    }

  // Update session
  async updateSession(req, res) {
    try {
      const { type, duration, start_time, end_time, completed, notes } = req.body;

      // Check if session exists
      const [sessions] = await sequelize.query(
        'SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (sessions.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Session not found'
        });
      }

      await sequelize.query(
        `UPDATE focus_sessions 
         SET type = COALESCE(?, type),
             duration = COALESCE(?, duration),
             start_time = COALESCE(?, start_time),
             end_time = COALESCE(?, end_time),
             completed = COALESCE(?, completed),
             notes = COALESCE(?, notes)
         WHERE id = ? AND user_id = ?`,
        {
          replacements: [
            type,
            duration,
            start_time,
            end_time,
            completed,
            notes,
            req.params.id,
            req.user.id
          ]
        }
      );

      const [updatedSession] = await sequelize.query(
        'SELECT * FROM focus_sessions WHERE id = ?',
        {
          replacements: [req.params.id]
        }
      );

      res.json({
        status: 'success',
        session: updatedSession[0]
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Delete session
  async deleteSession(req, res) {
    try {
      const [result] = await sequelize.query(
        'DELETE FROM focus_sessions WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Session not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Session deleted successfully'
      });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
}

export default new FocusController();