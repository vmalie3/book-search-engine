const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    async me(parent, args, context) {

      if (!context.user) {
        throw new AuthenticationError('Please login');
      };

      const foundUser = await User.findOne(
        {_id: context.user._id}).select('-__v -password').populate('books');
  
      return foundUser;
    },
  },

  Mutation: {
    async addUser(parent, args) {
      const user = await User.create(args);
      const token = signToken(user);
      return({ token, user });
    },
    async login(parent, { email, password }) {
      const user = await User.findOne({ email });
      const correctPw = await user.isCorrectPassword(password);
      const token = signToken(user);

      if (!user || !correctPw) {
        throw AuthenticationError('Incorrect email or password');
      };

      return{ token, user };
    },
    async saveBook(parent, args, context) {
      if(!context.user) {
        throw AuthenticationError('Please login')
      };
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: args } },
        { new: true, runValidators: true }
      );
      return updatedUser;
    },
    async removeBook(parent, args, context) {
      if(!context.user) {
        throw AuthenticationError('Please login')
      };
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      );
      return updatedUser;
    },
  }
};

module.exports = resolvers;