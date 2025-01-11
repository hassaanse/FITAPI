const Chat = require('../Models/Chat');

exports.sendMessage = async (req, res) => {
  try {
    const { inquiryId, senderId, message } = req.body;

    const chat = await Chat.create({
      inquiryId,
      senderId,
      message,
    });

    res.status(201).json({ message: 'Message sent successfully.', chat });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message.', error });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { inquiryId } = req.params;

    const messages = await Chat.findAll({ where: { inquiryId } });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages.', error });
  }
};
