'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiCall } from '@/lib/api';

interface ProgramDto {
  id: string;
  name: string;
  courses: Array<{
    id: string;
    name: string;
    cohorts: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  }>;
}

interface EnrollmentHistoryItem {
  id: string;
  status: string;
  enrolledAt: string;
  family?: { name: string } | null;
  student: { firstName: string; lastName: string };
  course: {
    name: string;
    program?: { name: string } | null;
  };
  cohort?: { name: string } | null;
}

interface DealLead {
  name: string;
  phone?: string;
  email?: string;
}

interface DealEnrollmentSectionProps {
  dealId: string;
  lead?: DealLead;
}

export default function DealEnrollmentSection({ dealId, lead }: DealEnrollmentSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<ProgramDto[]>([]);
  const [historyItems, setHistoryItems] = useState<EnrollmentHistoryItem[]>([]);

  const [formData, setFormData] = useState({
    courseId: '',
    cohortId: '',
    parentName: lead?.name || '',
    parentPhone: lead?.phone || '',
    parentEmail: lead?.email || '',
    studentFirstName: '',
    studentLastName: '',
    startsAt: '',
    notes: '',
  });

  const courses = useMemo(() => {
    return programs.flatMap((program) =>
      program.courses.map((course) => ({
        ...course,
        programName: program.name,
      })),
    );
  }, [programs]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === formData.courseId),
    [courses, formData.courseId],
  );

  const loadDealEnrollments = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await apiCall(`/crm/education/enrollments?dealId=${dealId}`);
      setHistoryItems(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load deal enrollments history', error);
      toast.error('Не удалось загрузить историю конверсий');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [dealId]);

  useEffect(() => {
    void loadDealEnrollments();
  }, [loadDealEnrollments]);

  const openForm = async () => {
    setIsOpen(true);
    if (programs.length > 0) return;

    setIsLoadingPrograms(true);
    try {
      const response = await apiCall('/crm/education/programs');
      const loadedPrograms: ProgramDto[] = Array.isArray(response) ? response : [];
      setPrograms(loadedPrograms);

      const firstCourse = loadedPrograms
        .flatMap((program) => program.courses)
        .find((course) => Boolean(course.id));

      if (firstCourse) {
        const firstCohort = firstCourse.cohorts?.find(
          (cohort) => cohort.status === 'active' || cohort.status === 'planned',
        );
        setFormData((prev) => ({
          ...prev,
          courseId: prev.courseId || firstCourse.id,
          cohortId: prev.cohortId || firstCohort?.id || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load education programs', error);
      toast.error('Не удалось загрузить программы');
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.courseId) {
      toast.error('Выберите курс');
      return;
    }
    if (!formData.parentName || !formData.studentFirstName || !formData.studentLastName) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiCall('/crm/education/enrollments/from-deal', {
        method: 'POST',
        body: {
          dealId,
          courseId: formData.courseId,
          cohortId: formData.cohortId || undefined,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone || undefined,
          parentEmail: formData.parentEmail || undefined,
          studentFirstName: formData.studentFirstName,
          studentLastName: formData.studentLastName,
          startsAt: formData.startsAt || undefined,
          notes: formData.notes || undefined,
        },
      });

      toast.success('Сделка конвертирована в зачисление');
      setIsOpen(false);
      await loadDealEnrollments();
      router.refresh();
    } catch (error) {
      console.error('Failed to convert deal to enrollment', error);
      toast.error('Ошибка конверсии сделки');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Конверсия в зачисление</h2>
      <p className="text-sm text-slate-600 mb-4">
        Создаёт семью, ученика и зачисление на курс из текущей сделки.
      </p>

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-900">История конверсий по сделке</h3>
        {isLoadingHistory ? (
          <p className="mt-2 text-sm text-slate-500">Загрузка...</p>
        ) : historyItems.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Конверсий пока не было.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {historyItems.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                <div className="font-medium text-slate-900">
                  {item.student.lastName} {item.student.firstName} · {item.course.program?.name ? `${item.course.program.name} / ` : ''}{item.course.name}
                </div>
                <div className="mt-1 text-slate-500">
                  {item.family?.name ?? 'Семья не указана'} · {item.cohort?.name ?? 'Без группы'} · {item.status} · {new Date(item.enrolledAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isOpen ? (
        <button
          onClick={openForm}
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Конвертировать сделку
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoadingPrograms ? (
            <p className="text-sm text-slate-500">Загрузка программ...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Курс *</span>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.courseId}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        courseId: event.target.value,
                        cohortId: '',
                      }))
                    }
                  >
                    <option value="">Выберите курс</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.programName} / {course.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Группа</span>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.cohortId}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, cohortId: event.target.value }))
                    }
                    disabled={!selectedCourse}
                  >
                    <option value="">Без группы</option>
                    {selectedCourse?.cohorts
                      ?.filter((cohort) => cohort.status === 'active' || cohort.status === 'planned')
                      .map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Родитель *</span>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.parentName}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, parentName: event.target.value }))
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Телефон</span>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.parentPhone}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, parentPhone: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Имя ученика *</span>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.studentFirstName}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, studentFirstName: event.target.value }))
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Фамилия ученика *</span>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.studentLastName}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, studentLastName: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Email</span>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.parentEmail}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, parentEmail: event.target.value }))
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-slate-600">Дата старта</span>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={formData.startsAt}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, startsAt: event.target.value }))
                    }
                  />
                </label>
              </div>

              <label className="text-sm block">
                <span className="mb-1 block text-slate-600">Комментарий</span>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={3}
                  value={formData.notes}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Сохраняем...' : 'Создать зачисление'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Отмена
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
