const mongoose = require('mongoose');

const empanadaSchema = mongoose.Schema(
  {
    // campos
    name: { type: String, required: [true, 'Nombra tu empanada.'] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('empanada', empanadaSchema);
