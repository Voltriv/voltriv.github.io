// Namespace for the interface
namespace ProjectTitle
{
    public interface IStudentRecord
    {
        string StudentID { get; set; }
        string FirstName { get; set; }
        string LastName { get; set; }
        double Attendance { get; set; }
        double WrittenQuiz { get; set; }
        double PracticalQuiz { get; set; }
        double Project { get; set; }
        double PrelimExam { get; set; }
        double ComputePrelimGrade();
    }
}

// Namespace for the class
namespace ProjectNamespace
{
    using ProjectTitle;

    public class StudentRecord : IStudentRecord
    {
        public string StudentID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public double Attendance { get; set; }
        public double WrittenQuiz { get; set; }
        public double PracticalQuiz { get; set; }
        public double Project { get; set; }
        public double PrelimExam { get; set; }

        // Compute the final grade based on weights
        public double ComputePrelimGrade()
        {
            return (Attendance * 0.1) + (WrittenQuiz * 0.1) + (PracticalQuiz * 0.2) + (Project * 0.3) + (PrelimExam * 0.3);
        }
    }
}

// Example usage in Form1.cs (partial code snippet)
using System;
using System.Collections.Generic;
using System.Windows.Forms;
using ProjectNamespace;

namespace GradingSystemApp
{
    public partial class Form1 : Form
    {
        private List<StudentRecord> students = new List<StudentRecord>();

        public Form1()
        {
            InitializeComponent();
        }

        private void btnSave_Click(object sender, EventArgs e)
        {
            var student = new StudentRecord
            {
                StudentID = txtStudentID.Text,
                FirstName = txtFirstName.Text,
                LastName = txtLastName.Text,
                Attendance = double.Parse(txtAttendance.Text),
                WrittenQuiz = double.Parse(txtWrittenQuiz.Text),
                PracticalQuiz = double.Parse(txtPracticalQuiz.Text),
                Project = double.Parse(txtProject.Text),
                PrelimExam = double.Parse(txtPrelimExam.Text)
            };

            double finalGrade = student.ComputePrelimGrade();
            txtPrelimGrade.Text = finalGrade.ToString("F2");

            students.Add(student);
            RefreshGrid();
        }

        private void RefreshGrid()
        {
            dataGridView1.DataSource = null;
            dataGridView1.DataSource = students;
        }
    }
}
