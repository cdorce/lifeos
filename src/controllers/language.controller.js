import { sequelize } from '../config/database.js';

class LanguageController {
  // Get all languages for user
  async getAllLanguages(req, res) {
    try {
      const [languages] = await sequelize.query(
        `SELECT 
          l.*,
          COUNT(DISTINCT lp.id) as completedLessons,
          MAX(lp.completed_at) as lastPracticed
         FROM languages l
         LEFT JOIN language_progress lp ON l.id = lp.language_id AND lp.completed = 1
         WHERE l.user_id = ?
         GROUP BY l.id
         ORDER BY l.created_at DESC`,
        {
          replacements: [req.user.id]
        }
      );

      res.json({
        status: 'success',
        count: languages.length,
        languages: languages
      });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Get single language
  async getLanguageById(req, res) {
    try {
      const [languages] = await sequelize.query(
        'SELECT * FROM languages WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (languages.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Language not found'
        });
      }

      res.json({
        status: 'success',
        language: languages[0]
      });
    } catch (error) {
      console.error('Get language error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

 // Create language
    async createLanguage(req, res) {
    try {
        const { name, native_name, flag, level, target_weeks } = req.body;

        console.log('Creating language with data:', req.body); // Debug log
        console.log('User ID:', req.user.id); // Debug log

        if (!name) {
        return res.status(400).json({
            status: 'error',
            message: 'Language name is required'
        });
        }

        await sequelize.query(
        `INSERT INTO languages (user_id, name, native_name, flag, level, target_weeks, current_week, current_day, streak)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
            replacements: [
            req.user.id,
            name,
            native_name || name,
            flag || '🌍',
            level || 'Beginner',
            target_weeks || 12,
            1,
            1,
            0
            ]
        }
        );

        // Get the last inserted ID
        const [[{ id: insertedId }]] = await sequelize.query(
        'SELECT LAST_INSERT_ID() as id'
        );

        console.log('Inserted language ID:', insertedId); // Debug log

        const [newLanguage] = await sequelize.query(
        'SELECT * FROM languages WHERE id = ?',
        {
            replacements: [insertedId]
        }
        );

        console.log('Created language:', newLanguage[0]); // Debug log

        res.status(201).json({
        status: 'success',
        language: newLanguage[0]
        });
    } catch (error) {
        console.error('Create language error:', error);
        console.error('Error message:', error.message); // More detailed error
        console.error('Error stack:', error.stack);
        res.status(500).json({
        status: 'error',
        message: 'Server error',
        error: error.message // Send error details
        });
    }
    }

  // Update language
  async updateLanguage(req, res) {
    try {
      const { name, native_name, flag, level, current_week, current_day, streak, target_weeks } = req.body;

      const [languages] = await sequelize.query(
        'SELECT * FROM languages WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (languages.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Language not found'
        });
      }

      await sequelize.query(
        `UPDATE languages 
         SET name = COALESCE(?, name),
             native_name = COALESCE(?, native_name),
             flag = COALESCE(?, flag),
             level = COALESCE(?, level),
             current_week = COALESCE(?, current_week),
             current_day = COALESCE(?, current_day),
             streak = COALESCE(?, streak),
             target_weeks = COALESCE(?, target_weeks)
         WHERE id = ? AND user_id = ?`,
        {
          replacements: [
            name,
            native_name,
            flag,
            level,
            current_week,
            current_day,
            streak,
            target_weeks,
            req.params.id,
            req.user.id
          ]
        }
      );

      const [updatedLanguage] = await sequelize.query(
        'SELECT * FROM languages WHERE id = ?',
        {
          replacements: [req.params.id]
        }
      );

      res.json({
        status: 'success',
        language: updatedLanguage[0]
      });
    } catch (error) {
      console.error('Update language error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Delete language
  async deleteLanguage(req, res) {
    try {
      const [result] = await sequelize.query(
        'DELETE FROM languages WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Language not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Language deleted successfully'
      });
    } catch (error) {
      console.error('Delete language error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Get language progress
  async getLanguageProgress(req, res) {
    try {
      const [progress] = await sequelize.query(
        `SELECT 
          COUNT(*) as totalLessons,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedLessons,
          AVG(CASE WHEN completed = 1 THEN score ELSE 0 END) as avgScore
         FROM language_progress
         WHERE language_id = ?`,
        {
          replacements: [req.params.id]
        }
      );

      const result = progress[0] || { totalLessons: 0, completedLessons: 0, avgScore: 0 };
      const progressPercent = result.totalLessons > 0 
        ? Math.round((result.completedLessons / result.totalLessons) * 100) 
        : 0;

      res.json({
        status: 'success',
        progress: {
          ...result,
          progressPercent
        }
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Update progress (streak, current week/day)
  async updateProgress(req, res) {
    try {
      const { current_week, current_day, streak } = req.body;

      await sequelize.query(
        `UPDATE languages 
         SET current_week = COALESCE(?, current_week),
             current_day = COALESCE(?, current_day),
             streak = COALESCE(?, streak),
             last_practiced = NOW()
         WHERE id = ? AND user_id = ?`,
        {
          replacements: [
            current_week,
            current_day,
            streak,
            req.params.id,
            req.user.id
          ]
        }
      );

      const [updatedLanguage] = await sequelize.query(
        'SELECT * FROM languages WHERE id = ?',
        {
          replacements: [req.params.id]
        }
      );

      res.json({
        status: 'success',
        language: updatedLanguage[0]
      });
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Get curriculum for a language
  async getCurriculum(req, res) {
    try {
      const [curriculum] = await sequelize.query(
        `SELECT 
          c.*,
          lp.completed,
          lp.score,
          lp.completed_at
         FROM curriculum c
         LEFT JOIN language_progress lp ON c.id = lp.lesson_id AND lp.language_id = ?
         WHERE c.language_id = ?
         ORDER BY c.week, c.day, c.order_index`,
        {
          replacements: [req.params.id, req.params.id]
        }
      );

      res.json({
        status: 'success',
        count: curriculum.length,
        curriculum: curriculum
      });
    } catch (error) {
      console.error('Get curriculum error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Create curriculum item
  async createCurriculumItem(req, res) {
    try {
      const { language_id, week, day, title, type, content, order_index } = req.body;

      if (!language_id || !week || !day || !title || !type) {
        return res.status(400).json({
          status: 'error',
          message: 'Language ID, week, day, title, and type are required'
        });
      }

      const contentJson = content ? JSON.stringify(content) : null;

      await sequelize.query(
        `INSERT INTO curriculum (language_id, week, day, title, type, content, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            language_id,
            week,
            day,
            title,
            type,
            contentJson,
            order_index || 0
          ]
        }
      );

      const [[{ id: insertedId }]] = await sequelize.query(
        'SELECT LAST_INSERT_ID() as id'
      );

      const [newItem] = await sequelize.query(
        'SELECT * FROM curriculum WHERE id = ?',
        {
          replacements: [insertedId]
        }
      );

      res.status(201).json({
        status: 'success',
        curriculum: newItem[0]
      });
    } catch (error) {
      console.error('Create curriculum error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Update curriculum item
  async updateCurriculumItem(req, res) {
    try {
      const { title, type, content } = req.body;

      const contentJson = content ? JSON.stringify(content) : null;

      await sequelize.query(
        `UPDATE curriculum 
         SET title = COALESCE(?, title),
             type = COALESCE(?, type),
             content = COALESCE(?, content)
         WHERE id = ?`,
        {
          replacements: [title, type, contentJson, req.params.id]
        }
      );

      const [updatedItem] = await sequelize.query(
        'SELECT * FROM curriculum WHERE id = ?',
        {
          replacements: [req.params.id]
        }
      );

      res.json({
        status: 'success',
        curriculum: updatedItem[0]
      });
    } catch (error) {
      console.error('Update curriculum error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }

  // Complete a lesson
  async completeLesson(req, res) {
    try {
      const { language_id, score } = req.body;

      if (!language_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Language ID is required'
        });
      }

      // Check if progress already exists
      const [existing] = await sequelize.query(
        'SELECT * FROM language_progress WHERE lesson_id = ? AND language_id = ?',
        {
          replacements: [req.params.id, language_id]
        }
      );

      if (existing.length > 0) {
        // Update existing
        await sequelize.query(
          `UPDATE language_progress 
           SET completed = 1, score = ?, completed_at = NOW()
           WHERE lesson_id = ? AND language_id = ?`,
          {
            replacements: [score || 100, req.params.id, language_id]
          }
        );
      } else {
        // Create new
        await sequelize.query(
          `INSERT INTO language_progress (language_id, lesson_id, completed, score, completed_at)
           VALUES (?, ?, 1, ?, NOW())`,
          {
            replacements: [language_id, req.params.id, score || 100]
          }
        );
      }

      res.json({
        status: 'success',
        message: 'Lesson completed successfully'
      });
    } catch (error) {
      console.error('Complete lesson error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
}

export default new LanguageController();