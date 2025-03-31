function generateFakeData(length) {
  return Array.from({ length }, (_, index) => ({
    id: index,
    name: `Item-${index}`,
  }));
}

export async function populateDatabase(db, numRecords) {
  try {
    const initRecords = generateFakeData(numRecords);

    for (const item of initRecords) {
      await db.put(item.id, item);
    }

    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}
