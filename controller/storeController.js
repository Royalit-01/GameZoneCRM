const Store = require('../models/Store');

// Save store data
exports.saveStoreData = async (req, res) => {
  try {
    const { name, number, address, screens, isCafeEnabled } = req.body;

    if (!name || !number || !address || !screens?.length) {
      return res.status(400).json({ error: 'Missing required store fields.' });
    }

    const newStore = new Store({ name, number, address, screens, isCafeEnabled });
    const savedStore = await newStore.save();

    return res.status(201).json({ message: 'Store saved successfully.', store: savedStore });
  } catch (err) {
    console.error('❌ Error saving store:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all store data
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().lean();

    if (!stores || stores.length === 0) {
      return res.status(404).json({ error: 'No stores found.' });
    }

    return res.status(200).json(stores);
  } catch (err) {
    console.error('❌ Error fetching store data:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update store data
exports.updateStoreData = async (req, res) => {
  const { storeNumber } = req.params;
  const { name, number, address, screens, isCafeEnabled } = req.body;

  try {
    const updatedStore = await Store.findOneAndUpdate(
      { number: storeNumber },
      { name, number, address, screens, isCafeEnabled },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    return res.status(200).json(updatedStore); // Only send updated data
  } catch (err) {
    console.error('❌ Error updating store:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete store data
exports.deleteStore = async (req, res) => {
  const { storeNumber } = req.params;

  try {
    const deletedStore = await Store.findOneAndDelete({ number: storeNumber });

    if (!deletedStore) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    return res.status(200).json({ message: 'Store deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting store:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};