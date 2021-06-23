import Instructor from "./Instructor";

export default interface Course{
    id?: number;
    name?: string;
    code?: string;
    creditHours?: number;
    instructors?: Instructor[];
    selectedInstructor?: number | null;
}