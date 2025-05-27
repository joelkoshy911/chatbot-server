const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

// Predefined FAQs
const faqs = [
  {
    question: /what security services do you offer/i,
    answer: `We provide a wide range of security solutions including:
• Hard-wired CCTV cameras
• Battery-operated CCTV cameras
• Self-powered CCTV towers
• Plug-in CCTV towers
• Biometric turnstiles
• Temporary fire safety systems
• Day and night security officers
• Banksman/gatemen
• Street sweeping and cleaning
• Timelapse cameras
• K9 services
• NFC
• Concierge services`
  },
  {
    question: /how (do i|get) (a )?quote/i,
    answer: `You can request a quote by:
• Using the chatbot on our website
• Calling us at 07778 238806
• Emailing info@nation-wide.co`
  },
  {
    question: /what areas|which areas|where do you operate/i,
    answer: `Nationwide Management Services operates across all of the UK.`
  },
  {
    question: /licenses|certifications|qualified/i,
    answer: `All our security personnel are fully licensed and trained to meet industry and legal standards.`
  },
  {
    question: /cancel.*contract|change.*contract/i,
    answer: `Yes, contract changes are possible depending on terms. Please contact our team to discuss.`
  },
  {
    question: /how do i contact|contact (details|info)/i,
    answer: `You can contact us at:
• Phone: 0151 709 9665
• Email: info@nation-wide.co
• Office: Graeme House, Derby Square, Liverpool, L2 7NX`
  },
  {
    question: /hours|open.*when|when.*open/i,
    answer: `Our office is open Mon–Fri, 9:00 AM – 5:00 PM. The chatbot is available 24/7.`
  },
  {
    question: /emergency/i,
    answer: `For emergencies, contact local emergency services first. Our team can assist with rapid response.`
  },
  {
    question: /what.*need.*quote|what info.*quote/i,
    answer: `To provide a quote, we need:
• Type of security service
• Location/site details
• Duration/schedule
• Any specific needs
• Your contact info`
  },
  {
    question: /data.*(privacy|protection)/i,
    answer: `We respect your privacy and follow all data protection laws. See our Privacy Policy for more.`
  }
];

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const lower = userMessage.toLowerCase();

  // Check if question matches an FAQ
  for (let faq of faqs) {
    if (faq.question.test(userMessage)) {
      return res.json({ reply: faq.answer });
    }
  }

  // Contact fallback
  if (lower.includes("phone") || lower.includes("call") || lower.includes("contact") || lower.includes("email")) {
    return res.json({ reply: "You can reach us at 0151 709 9665 or email info@nation-wide.co." });
  }

  // Default GPT response
  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: `
You are a helpful assistant for Nationwide Management Services.
Ask friendly questions to gather:
1. What service the visitor needs
2. Their location
3. When they need it
4. Their name + contact info

If they ask for contact info, reply with:
"You can reach us at 0151 709 9665 or email info@nation-wide.co."

Let them know their info will be passed to Lee in sales. Be friendly and helpful.
` },
      { role: 'user', content: userMessage }
    ]
  });

  const reply = completion.data.choices[0].message.content;
  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
