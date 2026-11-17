import Qualification from '../models/Qualification.js';
import { makeCrud } from './crud.js';

export default makeCrud(Qualification, {
  label: 'Qualification',
  fields: ['degree', 'institution', 'startYear', 'endYear', 'detail'],
  sort: { endYear: -1, startYear: -1 } // most recent first
});