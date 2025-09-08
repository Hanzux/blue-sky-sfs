
'use server';

import { initialLearners, initialSchools, initialFoodItems } from '@/lib/data';
import { getUsers } from '../admin/users/actions';
import { getCaregivers } from '../admin/caregivers/actions';

export async function searchAll(query: string) {
  const lowerCaseQuery = query.toLowerCase();

  const learnerResults = initialLearners.filter(l =>
    l.name.toLowerCase().includes(lowerCaseQuery)
  ).map(l => ({ id: l.id, name: l.name }));

  const schoolResults = initialSchools.filter(s =>
    s.name.toLowerCase().includes(lowerCaseQuery)
  ).map(s => ({ id: s.id, name: s.name }));
  
  const foodItemResults = initialFoodItems.filter(f =>
    f.name.toLowerCase().includes(lowerCaseQuery)
  ).map(f => ({ id: f.id, name: f.name }));

  let userResults: any[] = [];
  try {
    userResults = (await getUsers()).filter(u =>
      (u.name && u.name.toLowerCase().includes(lowerCaseQuery)) ||
      (u.email && u.email.toLowerCase().includes(lowerCaseQuery))
    );
  } catch (error) {
      console.warn("Could not search users, Firebase Admin SDK likely not configured.", error);
  }
  
  const caregiverResults = (await getCaregivers()).filter(c =>
    c.name.toLowerCase().includes(lowerCaseQuery)
  );

  return {
    learners: learnerResults,
    schools: schoolResults,
    foodItems: foodItemResults,
    users: userResults,
    caregivers: caregiverResults,
  };
}
