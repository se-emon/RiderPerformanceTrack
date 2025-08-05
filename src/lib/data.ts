import type { Rider, Entry } from './types';

export const riders: Rider[] = [
  { id: '1', name: 'Alex Green' },
  { id: '2', name: 'Maria Garcia' },
  { id: '3', name: 'Sam Taylor' },
  { id: '4', name: 'Chen Wei' },
  { id: '5', name: 'Fatima Al-Sayed' },
];

const generateEntries = (): Entry[] => {
    const entries: Entry[] = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const numRidersToday = Math.floor(Math.random() * 3) + 1;
        const usedRiderIndices = new Set<number>();
        while(usedRiderIndices.size < numRidersToday) {
            usedRiderIndices.add(Math.floor(Math.random() * riders.length));
        }
        
        usedRiderIndices.forEach(riderIndex => {
            const successful = Math.floor(Math.random() * 50) + 5;
            const failed = Math.floor(Math.random() * 5);
            const returned = Math.floor(Math.random() * 3);
            
            entries.push({
                id: `${date.getTime()}-${riders[riderIndex].id}`,
                date,
                riderId: riders[riderIndex].id,
                successful,
                failed,
                returned,
            });
        });
    }
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
};


export const initialEntries: Entry[] = generateEntries();
