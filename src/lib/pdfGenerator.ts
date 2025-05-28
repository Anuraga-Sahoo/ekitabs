
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
  let currentY = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Test Report - TestPrep AI', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Test Details
  doc.setFontSize(12);
  doc.text(`Test Title: ${result.testTitle || result.testType}`, 15, currentY);
  currentY += 7;
  doc.text(`Test Type: ${result.testType === 'mock' ? 'Mock Test (MCQ)' : 'Practice Test (MCQ)'}`, 15, currentY);
  currentY += 7;
  doc.text(`Date: ${new Date(result.dateCompleted).toLocaleDateString()}`, 15, currentY);
  currentY += 7;
  
  if (result.testType === 'practice' && result.config) {
    doc.text(`Subject: ${result.config.subject}`, 15, currentY);
    currentY += 7;
    doc.text(`Chapter: ${result.config.chapter}`, 15, currentY);
    currentY += 7;
    doc.text(`Complexity: ${result.config.complexityLevel}`, 15, currentY);
    currentY += 7;
  }

  // New Summary Stats
  doc.text(`Total Questions: ${result.questions.length}`, 15, currentY);
  currentY += 7;
  doc.text(`Attempted Questions: ${result.score.correct + result.score.incorrect}`, 15, currentY);
  currentY += 10;


  // Score Summary
  doc.setFontSize(14);
  doc.text('Score Summary', 15, currentY);
  currentY += 7;
  doc.setFontSize(10);
  const scoreDetails = [
    `Correct Answers: ${result.score.correct}`,
    `Incorrect Answers: ${result.score.incorrect}`,
    `Unanswered: ${result.score.unanswered}`,
    `Total Score: ${result.score.totalScore} / ${result.score.maxScore}`,
  ];
  scoreDetails.forEach((text) => {
    doc.text(text, 15, currentY);
    currentY += 7;
  });
  
  // Questions and Answers Table
  currentY += 5; // Add some space before table
  doc.setFontSize(14);
  doc.text('Questions & Answers Analysis', 15, currentY);
  currentY += 7;

  const tableColumn = ["#", "Question & Options", "Your Answer", "Correct Answer", "Marks"];
  const tableRows: (string | number)[][] = [];

  result.questions.forEach((q, index) => {
    const userAnswerDisplay = q.userAnswer || 'Not Answered';
    let marks = 0;
    if (q.userAnswer && q.userAnswer.trim() !== "") {
        if (q.userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            marks = 4;
        } else {
            marks = -1;
        }
    }

    const optionsString = q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
    const questionWithOptions = `${q.questionText}\n\nOptions:\n${optionsString}`;

    const questionData = [
      index + 1,
      questionWithOptions,
      userAnswerDisplay,
      q.correctAnswer,
      marks,
    ];
    tableRows.push(questionData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: currentY,
    theme: 'grid',
    headStyles: { fillColor: [75, 0, 130] }, // Primary color: Deep Indigo
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // #
      1: { cellWidth: 95 }, // Question & Options
      2: { cellWidth: 30 }, // Your Answer
      3: { cellWidth: 30 }, // Correct Answer
      4: { cellWidth: 15, halign: 'center' }, // Marks
    },
    didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.pages.length; 
        if (pageCount > 0 ) { 
          doc.setFontSize(8);
          doc.text(`Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    }
  });
  
  const fileName = `TestPrepAI_${result.testTitle || result.testType}_${new Date(result.dateCompleted).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

