const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    async getSingleUser(parent, { user = null, params }) {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      });
  
      if (!foundUser) {
        return res.status(400).json({ message: 'Cannot find a user with this id!' });
      }
  
      return foundUser;
    },
  },

  Mutation: {
    async createUser(parent, args) {
      const user = await User.create(args);
      const token = signToken(user);
      return({ token, user });
    },
    async login(parent, args) {
      const user = await User.findOne({ $or: [{ username: args.username }, { email: args.email }] });
      const correctPw = await user.isCorrectPassword(args.password);
      const token = signToken(user);
      return{ token, user };
    },
    async saveBook(parent, args) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: args._id },
        { $addToSet: { savedBooks: args } },
        { new: true, runValidators: true }
      );
      return updatedUser;
    },
    async deleteBook(parent, args) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: args._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      );
      return updatedUser;
    },
  }
};

module.exports = resolvers;