const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

counterSchema.statics.getNextSequence = async function (year) {
  const counter = await this.findOneAndUpdate(
    { year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
