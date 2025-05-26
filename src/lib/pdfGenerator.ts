
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import autoTable plugin
import type { TestResultItem, AppQuestion } from '@/types';

// Extend jsPDF with autoTable, if types are not globally available
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export function generateTestPdf(result: TestResultItem): void {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text('Test Report - TestPrep AI', pageWidth / 2, 20, { align: 'center' });

  // Test Details
  doc.setFontSize(12);
  doc.text(`Test Type: ${result.testType === 'mock' ? 'Mock Test' : 'Practice Test'}`, 15, 35);
  doc.text(`Date: ${new Date(result.dateCompleted).toLocaleDateString()}`, 15, 42);
  if (result.testType === 'practice' && result.config) {
    doc.text(`Subject: ${result.config.subject}`, 15, 49);
    doc.text(`Chapter: ${result.config.chapter}`, 15, 56);
    doc.text(`Complexity: ${result.config.complexityLevel}`, 15, 63);
  }

  // Score Summary
  doc.setFontSize(14);
  doc.text('Score Summary', 15, 75);
  doc.setFontSize(10);
  const scoreDetails = [
    `Correct Answers: ${result.score.correct}`,
    `Incorrect Answers: ${result.score.incorrect}`,
    `Unanswered: ${result.score.unanswered}`,
    `Total Score: ${result.score.totalScore} / ${result.score.maxScore}`,
  ];
  scoreDetails.forEach((text, index) => {
    doc.text(text, 15, 82 + index * 7);
  });
  
  // Questions and Answers Table
  doc.setFontSize(14);
  doc.text('Questions & Answers', 15, 82 + scoreDetails.length * 7 + 10);

  const tableColumn = ["#", "Question", "Your Answer", "Correct Answer", "Marks"];
  const tableRows: (string | number)[][] = [];

  result.questions.forEach((q, index) => {
    const userAnswer = q.userAnswer || 'Not Answered';
    let marks = 0;
    if (userAnswer !== 'Not Answered') {
        // Simple case-insensitive comparison for text answers
        if (userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            marks = 4;
        } else {
            marks = -1;
        }
    }

    const questionData = [
      index + 1,
      q.questionText,
      userAnswer,
      q.correctAnswer,
      marks,
    ];
    tableRows.push(questionData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 82 + scoreDetails.length * 7 + 17,
    theme: 'grid',
    headStyles: { fillColor: [75, 0, 130] }, // Primary color: Deep Indigo
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10 }, // #
      1: { cellWidth: 'auto' }, // Question
      2: { cellWidth: 'auto' }, // Your Answer
      3: { cellWidth: 'auto' }, // Correct Answer
      4: { cellWidth: 15 }, // Marks
    },
    didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.pages.length;
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber} of ${pageCount -1 }`, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
  });
  
  const fileName = `TestPrepAI_${result.testType}_${new Date(result.dateCompleted).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
