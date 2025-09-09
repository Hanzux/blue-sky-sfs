

export type School = {
  id: string;
  code: string;
  name:string;
  district: string;
  learners: number;
};

export const initialSchools: School[] = [
    { id: '1', code: 'MT001', name: 'Dotito Primary School', district: 'Mt Darwin', learners: 100 },
    { id: '2', code: 'MT002', name: 'Kadohwata Primary School', district: 'Mt Darwin', learners: 100 },
    { id: '3', code: 'MT003', name: 'Chiutsa primary school', district: 'Mt Darwin', learners: 100 },
    { id: '4', code: 'MT004', name: 'Pachanza Primary School', district: 'Mt Darwin', learners: 100 },
    { id: '5', code: 'MT005', name: 'Kajoto Primary School', district: 'Mt Darwin', learners: 100 },
    { id: '6', code: 'MT006', name: 'Kazai primary school', district: 'Mt Darwin', learners: 100 },
    { id: '7', code: 'MT007', name: 'Chiromo primary School', district: 'Mt Darwin', learners: 100 },
    { id: '8', code: 'MT008', name: 'Kanyoka primary school', district: 'Mt Darwin', learners: 100 },
    { id: '9', code: 'MB001', name: 'Mahuhwe Primary School', district: 'Mbire', learners: 100 },
    { id: '10', code: 'MB002', name: 'Sangojena Primary School', district: 'Mbire', learners: 100 },
    { id: '11', code: 'MB003', name: 'Bande Primary School', district: 'Mbire', learners: 100 },
    { id: '12', code: 'MB004', name: 'Kasuwo Primary School', district: 'Mbire', learners: 100 },
    { id: '13', code: 'MB005', name: 'Hambe Primary School', district: 'Mbire', learners: 100 },
    { id: '14', code: 'MB006', name: 'Nyarutombo primary school', district: 'Mbire', learners: 100 },
    { id: '15', code: 'MB007', name: 'Masomo Primary School', district: 'Mbire', learners: 100 },
    { id: '16', code: 'MB008', name: 'Nyambudzi Primary School', district: 'Mbire', learners: 100 },
];

export type Learner = {
  id: string;
  code: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female';
  className: string;
  guardian: string;
  district: string;
  school: string;
};

const learnersData = [
    { id: '1', name: 'John Doe', dob: '2015-03-12', gender: 'Male', className: 'Grade 1', guardian: 'Jane Doe', district: 'Mt Darwin', school: 'Dotito Primary School' },
    { id: '2', name: 'Alice Smith', dob: '2016-07-21', gender: 'Female', className: 'Kindergarten', guardian: 'Bob Smith', district: 'Mbire', school: 'Mahuhwe Primary School' },
    { id: '3', name: 'Michael Johnson', dob: '2014-11-02', gender: 'Male', className: 'Grade 2', guardian: 'Chris Johnson', district: 'Mt Darwin', school: 'Kadohwata Primary School' },
    { id: '4', name: 'Emily Brown', dob: '2015-09-05', gender: 'Female', className: 'Grade 1', guardian: 'William Brown', district: 'Mt Darwin', school: 'Dotito Primary School' },
    { id: '5', name: 'David Wilson', dob: '2016-01-15', gender: 'Male', className: 'Kindergarten', guardian: 'Mary Wilson', district: 'Mbire', school: 'Mahuhwe Primary School' },
    { id: '6', name: 'Sophia Miller', dob: '2014-06-30', gender: 'Female', className: 'Grade 2', guardian: 'James Miller', district: 'Mt Darwin', school: 'Kadohwata Primary School' },
];

const schoolLearnerCount: Record<string, number> = {};

export const initialLearners: Learner[] = learnersData.map(learner => {
    const school = initialSchools.find(s => s.name === learner.school);
    if (!school) {
        return { ...learner, code: 'N/A' };
    }
    const classCode = learner.className.split(' ').map(word => word[0]).join('').toUpperCase();
    const classLearnerKey = `${school.id}-${learner.className}`;
    const count = (schoolLearnerCount[classLearnerKey] || 0) + 1;
    schoolLearnerCount[classLearnerKey] = count;

    return {
        ...learner,
        code: `${school.code}-${classCode}-${count.toString().padStart(3, '0')}`
    }
});


export type FoodItem = {
    id: string;
    name: string;
    category: string;
    unit: string;
    stock: number;
    district?: string;
    school?: string;
};
  
export const initialFoodItems: FoodItem[] = [
    { id: '1', name: 'Maize Meal', category: 'Grains', unit: 'kg', stock: 150, district: 'Mt Darwin', school: 'Dotito Primary School' },
    { id: '2', name: 'Beans', category: 'Legumes', unit: 'kg', stock: 80, district: 'Mt Darwin', school: 'Dotito Primary School'  },
    { id: '3', name: 'Cooking Oil', category: 'Oils', unit: 'litres', stock: 50, district: 'Mbire', school: 'Mahuhwe Primary School'  },
    { id: '4', name: 'Salt', category: 'Condiments', unit: 'kg', stock: 25, district: 'Mbire', school: 'Mahuhwe Primary School'  },
    { id: '5', name: 'Eggs', category: 'Protein', unit: 'crates', stock: 40, district: 'Mt Darwin', school: 'Kadohwata Primary School' },
    { id: '6', name: 'Vegetables', category: 'Produce', unit: 'kg', stock: 60, district: 'Mt Darwin', school: 'Chiutsa primary school'},
    { id: '7', name: '1 Pot Meal', category: 'Composite Meals', unit: 'servings', stock: 200, district: 'Mbire', school: 'Sangojena Primary School'}
];
