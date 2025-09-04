
export type School = {
  id: string;
  name: string;
  district: string;
  learners: number;
};

export const initialSchools: School[] = [
    { id: '1', name: 'Dotito Prim', district: 'Mt Darwin', learners: 100 },
    { id: '2', name: 'Kadohwata', district: 'Mt Darwin', learners: 100 },
    { id: '3', name: 'Chiutsa pri', district: 'Mt Darwin', learners: 100 },
    { id: '4', name: 'Pachanza', district: 'Mt Darwin', learners: 100 },
    { id: '5', name: 'Kajoto Prin', district: 'Mt Darwin', learners: 100 },
    { id: '6', name: 'Kazai prim', district: 'Mt Darwin', learners: 100 },
    { id: '7', name: 'Chiromo p', district: 'Mt Darwin', learners: 100 },
    { id: '8', name: 'Kanyoka pr', district: 'Mt Darwin', learners: 100 },
    { id: '9', name: 'Mahuhwe', district: 'Mbire', learners: 100 },
    { id: '10', name: 'Sangojena', district: 'Mbire', learners: 100 },
    { id: '11', name: 'Bande Prin', district: 'Mbire', learners: 100 },
    { id: '12', name: 'Kasuwo Pr', district: 'Mbire', learners: 100 },
    { id: '13', name: 'Hambe Pri', district: 'Mbire', learners: 100 },
    { id: '14', name: 'Nyarutomb', district: 'Mbire', learners: 100 },
    { id: '15', name: 'Masomo P', district: 'Mbire', learners: 100 },
    { id: '16', name: 'Nyambudz', district: 'Mbire', learners: 100 },
];

export type Learner = {
  id: string;
  name: string;
  dob: string;
  className: string;
  guardian: string;
};

export const initialLearners: Learner[] = [
    { id: '1', name: 'John Doe', dob: '2015-03-12', className: 'Grade 1', guardian: 'Jane Doe' },
    { id: '2', name: 'Alice Smith', dob: '2016-07-21', className: 'Kindergarten', guardian: 'Bob Smith' },
    { id: '3', name: 'Michael Johnson', dob: '2014-11-02', className: 'Grade 2', guardian: 'Chris Johnson' },
];
