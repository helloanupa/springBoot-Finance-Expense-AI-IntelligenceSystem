const express = require('express');
const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const AIInsight = require('../models/AIInsight');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Initialize OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Helper: Get user transaction context
async function getUserFinancialContext(userId, months = 3) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate }
  }).sort('-date').limit(100);

  const summary = await Transaction.aggregate([
    { $match: { userId } },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);

  const categoryBreakdown = await Transaction.aggregate([
    { $match: { userId, type: 'expense', date: { $gte: startDate } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  const income = summary.find(s => s._id === 'income')?.total || 0;
  const expense = summary.find(s => s._id === 'expense')?.total || 0;

  return { transactions, income, expense, balance: income - expense, categoryBreakdown };
}

// Helper: Format data for AI prompt
function formatDataForAI(context, user) {
  const { transactions, income, expense, balance, categoryBreakdown } = context;
  
  const txSummary = transactions.slice(0, 30).map(t => 
    `${t.date.toISOString().split('T')[0]} | ${t.type.toUpperCase()} | ${t.category} | $${t.amount} | ${t.description}`
  ).join('\n');

  const catSummary = categoryBreakdown.map(c => 
    `${c._id}: $${c.total.toFixed(2)} (${c.count} transactions)`
  ).join('\n');

  return `
User: ${user.name}
Monthly Budget: $${user.monthlyBudget}
Total Income (last 3 months): $${income.toFixed(2)}
Total Expenses (last 3 months): $${expense.toFixed(2)}
Net Balance: $${balance.toFixed(2)}

Category Breakdown:
${catSummary}

Recent Transactions (last 30):
${txSummary}
  `.trim();
}

// Helper: Generate insights without AI (fallback)
function generateFallbackInsights(context, user) {
  const { income, expense, balance, categoryBreakdown } = context;
  const insights = [];
  const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;
  const budgetUsage = user.monthlyBudget > 0 ? (expense / (user.monthlyBudget * 3) * 100) : 0;

  insights.push({
    type: 'spending_analysis',
    title: '📊 Financial Health Overview',
    message: `Your savings rate is ${savingsRate.toFixed(1)}%. ${
      savingsRate >= 20 ? 'Excellent! You are saving well above the recommended 20%.' :
      savingsRate >= 10 ? 'Good progress! Try to reach the 20% savings target.' :
      'Warning: Your savings rate is below 10%. Consider reducing expenses.'
    }`,
    severity: savingsRate >= 20 ? 'positive' : savingsRate >= 10 ? 'info' : 'warning'
  });

  if (budgetUsage > 100) {
    insights.push({
      type: 'overspending_alert',
      title: '🚨 Budget Exceeded',
      message: `You have exceeded your monthly budget by ${(budgetUsage - 100).toFixed(1)}%. Immediate action recommended.`,
      severity: 'critical'
    });
  }

  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0];
    const pct = income > 0 ? (topCategory.total / income * 100) : 0;
    insights.push({
      type: 'pattern_detection',
      title: `💡 Top Spending: ${topCategory._id}`,
      message: `Your highest spending is on ${topCategory._id} at $${topCategory.total.toFixed(2)} (${pct.toFixed(1)}% of income). This category has ${topCategory.count} transactions.`,
      severity: pct > 30 ? 'warning' : 'info'
    });
  }

  if (savingsRate > 0) {
    const annualSavings = balance * 4;
    insights.push({
      type: 'savings_suggestion',
      title: '💰 Savings Projection',
      message: `At your current rate, you'll save approximately $${annualSavings.toFixed(2)} per year. ${
        annualSavings > 10000 ? 'Consider investing in index funds.' : 'Build an emergency fund of 3-6 months expenses first.'
      }`,
      severity: 'positive'
    });
  }

  return insights;
}

// Helper: Predict next month (fallback)
function generateFallbackPrediction(context) {
  const { expense, categoryBreakdown } = context;
  const avgMonthlyExpense = expense / 3;
  const predictions = categoryBreakdown.map(c => ({
    category: c._id,
    predicted: (c.total / 3 * 1.05).toFixed(2)
  }));

  return {
    totalPredicted: (avgMonthlyExpense * 1.05).toFixed(2),
    categories: predictions,
    trend: avgMonthlyExpense > 0 ? 'stable' : 'insufficient_data',
    confidence: '72%',
    note: 'Prediction based on 3-month average with 5% growth adjustment. Add your OpenAI API key for advanced AI predictions.'
  };
}

// @route   POST /api/ai/insights
router.post('/insights', async (req, res) => {
  try {
    const context = await getUserFinancialContext(req.user._id);
    const user = await User.findById(req.user._id);
    let insights = [];

    if (openai) {
      try {
        const financialData = formatDataForAI(context, user);
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional financial analyst AI. Analyze transaction data and provide specific, actionable insights. 
              Return a JSON array with exactly 4-5 insights. Each insight must have: 
              { "type": "spending_analysis|overspending_alert|savings_suggestion|pattern_detection|monthly_report", 
                "title": "emoji + short title", 
                "message": "detailed insight (2-3 sentences)", 
                "severity": "info|warning|critical|positive" }
              Be specific with numbers, percentages, and recommendations. Do NOT be generic.`
            },
            {
              role: 'user',
              content: `Analyze this financial data and provide personalized insights:\n\n${financialData}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        insights = parsed.insights || parsed;
        if (!Array.isArray(insights)) insights = Object.values(parsed)[0] || generateFallbackInsights(context, user);
      } catch (aiError) {
        console.error('OpenAI error, using fallback:', aiError.message);
        insights = generateFallbackInsights(context, user);
      }
    } else {
      insights = generateFallbackInsights(context, user);
    }

    // Save insights to DB
    const savedInsights = await Promise.all(insights.map(insight => 
      AIInsight.create({
        userId: req.user._id,
        insightType: insight.type,
        title: insight.title,
        message: insight.message,
        severity: insight.severity || 'info',
        data: context
      })
    ));

    res.json({ success: true, data: savedInsights, aiPowered: !!openai });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, message: 'Error generating insights' });
  }
});

// @route   GET /api/ai/insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await AIInsight.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(20);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching insights' });
  }
});

// @route   POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const context = await getUserFinancialContext(req.user._id);
    const user = await User.findById(req.user._id);
    const financialData = formatDataForAI(context, user);

    let reply = '';

    if (openai) {
      try {
        const messages = [
          {
            role: 'system',
            content: `You are a personal AI financial advisor with access to the user's real financial data. 
            You must answer based on their ACTUAL data, not generic advice. Be specific, empathetic, and actionable.
            Current Financial Context:
            ${financialData}
            
            Guidelines:
            - Reference specific numbers from their data
            - Provide tailored, personalized advice
            - Be conversational but professional
            - Use emojis sparingly for readability
            - If asked about predictions, base them on their actual spending patterns`
          },
          ...conversationHistory.slice(-8).map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.8,
          max_tokens: 600
        });

        reply = completion.choices[0].message.content;
      } catch (aiError) {
        console.error('OpenAI chat error:', aiError.message);
        reply = generateFallbackChatResponse(message, context, user);
      }
    } else {
      reply = generateFallbackChatResponse(message, context, user);
    }

    res.json({ success: true, reply, aiPowered: !!openai });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Error processing chat' });
  }
});

function generateFallbackChatResponse(message, context, user) {
  const { income, expense, balance, categoryBreakdown } = context;
  const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;
  const msgLower = message.toLowerCase();

  if (msgLower.includes('overspend') || msgLower.includes('spending too much')) {
    const topCat = categoryBreakdown[0];
    return `📊 Based on your data, your total expenses over the last 3 months are $${expense.toFixed(2)} against income of $${income.toFixed(2)}. ${
      topCat ? `Your biggest spending category is **${topCat._id}** at $${topCat.total.toFixed(2)}.` : ''
    } ${expense > income ? '⚠️ You are spending more than you earn — immediate budget review needed.' : '✅ Good news: your expenses are below your income.'}`;
  }

  if (msgLower.includes('save') || msgLower.includes('saving')) {
    return `💰 Your current savings rate is **${savingsRate}%**. ${
      parseFloat(savingsRate) >= 20 ? "Great work! You're saving above the recommended 20%." :
      "Aim for 20% savings. "
    } With a balance of $${balance.toFixed(2)} over 3 months, you're saving approximately $${(balance/3).toFixed(2)} per month. Consider automating savings transfers on payday.`;
  }

  if (msgLower.includes('financial health') || msgLower.includes('how am i doing')) {
    return `📈 **Financial Health Summary:**\n\n• Income (3 months): $${income.toFixed(2)}\n• Expenses (3 months): $${expense.toFixed(2)}\n• Net Balance: $${balance.toFixed(2)}\n• Savings Rate: ${savingsRate}%\n\nYour financial health is **${parseFloat(savingsRate) >= 20 ? 'excellent' : parseFloat(savingsRate) >= 10 ? 'moderate' : 'needs improvement'}**. ${parseFloat(savingsRate) < 20 ? 'Focus on reducing your top spending categories.' : 'Keep it up and consider investing your surplus!'}`;
  }

  if (msgLower.includes('predict') || msgLower.includes('next month')) {
    const avgMonthly = expense / 3;
    return `🔮 Based on your 3-month spending average, I predict your next month expenses will be around **$${(avgMonthly * 1.05).toFixed(2)}**. ${
      categoryBreakdown.length > 0 ? `Your top category (${categoryBreakdown[0]._id}) will likely cost ~$${(categoryBreakdown[0].total/3*1.05).toFixed(2)}.` : ''
    } To improve accuracy, add your OpenAI API key for AI-powered predictions.`;
  }

  return `💬 Based on your financial data: you have $${income.toFixed(2)} income and $${expense.toFixed(2)} expenses over 3 months (savings rate: ${savingsRate}%). For AI-powered personalized advice, please add your OpenAI API key to the backend .env file. I can still answer questions about your spending patterns, savings, and financial health!`;
}

// @route   POST /api/ai/prediction
router.post('/prediction', async (req, res) => {
  try {
    const context = await getUserFinancialContext(req.user._id, 3);
    const user = await User.findById(req.user._id);
    let prediction = null;

    if (openai) {
      try {
        const financialData = formatDataForAI(context, user);
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a financial prediction AI. Based on the transaction history, predict next month's spending.
              Return JSON: { "totalPredicted": number, "categories": [{"category": string, "predicted": number, "trend": "up|down|stable"}], "confidence": string, "warnings": [string], "recommendations": [string] }`
            },
            {
              role: 'user',
              content: `Based on this data, predict next month's expenses:\n\n${financialData}`
            }
          ],
          temperature: 0.5,
          max_tokens: 600,
          response_format: { type: 'json_object' }
        });

        prediction = JSON.parse(completion.choices[0].message.content);
      } catch (aiError) {
        console.error('Prediction AI error:', aiError.message);
        prediction = generateFallbackPrediction(context);
      }
    } else {
      prediction = generateFallbackPrediction(context);
    }

    res.json({ success: true, data: prediction, aiPowered: !!openai });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ success: false, message: 'Error generating prediction' });
  }
});

// @route   PATCH /api/ai/insights/:id/read
router.patch('/insights/:id/read', async (req, res) => {
  try {
    await AIInsight.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating insight' });
  }
});

module.exports = router;
