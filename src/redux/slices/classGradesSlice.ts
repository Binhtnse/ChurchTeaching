import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Student {
  id: number;
  studentId: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
  scores: { [examName: string]: number };
}

interface GradeTemplate {
  id: number;
  name: string;
  maxExamCount: number;
  exams: {
    id: number;
    name: string;
    weight: number;
    status: string | null;
    gradeTemplateName: string;
  }[];
}

interface ClassGradesState {
  students: Student[];
  gradeTemplate: GradeTemplate | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  allCellsFilled: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

const initialState: ClassGradesState = {
  students: [],
  gradeTemplate: null,
  loading: false,
  error: null,
  isEditing: false,
  allCellsFilled: false,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
};

export const fetchClassGrades = createAsyncThunk(
  "classGrades/fetchClassGrades",
  async ({
    classId,
    page,
    pageSize,
  }: {
    classId: string;
    page: number;
    pageSize: number;
  }) => {
    const accessToken = localStorage.getItem("accessToken");
    const [studentsResponse, gradesResponse] = await Promise.all([
      axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ),
      axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/student-grade/class/${classId}?page=${page}&size=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ),
    ]);

    const students = studentsResponse.data.data.students;
    const grades = gradesResponse.data.data;

    const gradeMap = new Map();
    grades.forEach(
      (grade: { account: string; examName: string; score: number }) => {
        if (!gradeMap.has(grade.account)) {
          gradeMap.set(grade.account, { scores: {} });
        }
        gradeMap.get(grade.account).scores[grade.examName] = grade.score;
      }
    );

    const combinedData = students.map((student: Student) => {
      const gradeData = gradeMap.get(student.account) || { scores: {} };
      return {
        ...student,
        ...gradeData,
        scores: gradeData.scores,
      };
    });

    return {
      students: combinedData,
      pagination: {
        current: gradesResponse.data.pageResponse.currentPage,
        pageSize: gradesResponse.data.pageResponse.pageSize,
        total: studentsResponse.data.data.students.length,
      },
    };
  }
);

export const fetchGradeTemplate = createAsyncThunk(
  "classGrades/fetchGradeTemplate",
  async () => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.get<{ data: GradeTemplate[] }>(
      `https://sep490-backend-production.up.railway.app/api/v1/grade-template/list?page=1&size=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.data[0];
  }
);

export const saveGrades = createAsyncThunk(
  "classGrades/saveGrades",
  async (_, { getState }) => {
    const state = getState() as { classGrades: ClassGradesState };
    const { students, gradeTemplate } = state.classGrades;
    const accessToken = localStorage.getItem("accessToken");

    const examScores =
      gradeTemplate?.exams?.map((exam) => ({
        examId: exam.id,
        score: 0,
      })) || [];

    const savePromises = students.map(async (student) => {
      const studentExams = examScores.map((exam) => ({
        ...exam,
        score:
          student.scores[
            gradeTemplate?.exams?.find((e) => e.id === exam.examId)?.name || ""
          ] || 0,
      }));

      await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/student-grade",
        {
          studentClassIds: [student.studentClassId],
          exams: studentExams,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }); 

    await Promise.all(savePromises);
  }
);

const classGradesSlice = createSlice({
  name: "classGrades",
  initialState,
  reducers: {
    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    updateStudentScore: (
      state,
      action: PayloadAction<{
        studentId: number;
        examName: string;
        score: number | undefined;
      }>
    ) => {
      const { studentId, examName, score } = action.payload;
      console.log("Updating score:", { studentId, examName, score });
      const student = state.students.find((s) => s.id === studentId);
      if (student) {
        if (score === undefined) {
          delete student.scores[examName];
        } else {
          student.scores[examName] = score;
        }
        console.log("Updated student:", student);
      }
    },
    checkAllCellsFilled: (state) => {
      state.allCellsFilled = state.students.every((student) =>
        state.gradeTemplate?.exams?.every(
          (exam) => student.scores[exam.name] !== undefined
        )
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassGrades.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClassGrades.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClassGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch class grades";
      })
      .addCase(fetchGradeTemplate.fulfilled, (state, action) => {
        state.gradeTemplate = action.payload;
      })
      .addCase(saveGrades.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveGrades.fulfilled, (state) => {
        state.loading = false;
        state.isEditing = false;
      })
      .addCase(saveGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save grades";
      });
  },
});

export const { setIsEditing, updateStudentScore, checkAllCellsFilled } =
  classGradesSlice.actions;

export default classGradesSlice.reducer;
