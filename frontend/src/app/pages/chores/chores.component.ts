import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CHORE_RECURRENCES, Chore, ChoreRecurrence } from '../../models/chore.model';
import { daysUntilDue, dueColorClass, dueLabel } from '../../models/deadline.model';
import { FamilyMember } from '../../models/user.model';
import { ChoreService } from '../../services/chore.service';
import { FamilyService } from '../../services/family.service';

interface ChoreForm {
  title: string;
  assigneeUserId: number | null;
  dueDate: string;
  recurrence: ChoreRecurrence;
}

function emptyForm(): ChoreForm {
  return { title: '', assigneeUserId: null, dueDate: '', recurrence: 'NONE' };
}

/**
 * 🧹 Household Chores: who does what, with optional due dates and recurrence.
 * Marking a recurring chore done rolls it forward to its next occurrence.
 */
@Component({
  selector: 'app-chores',
  imports: [FormsModule],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">🧹 Chores</h2>

      <!-- Add / edit form -->
      <form (ngSubmit)="submit()" class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        @if (editingId() !== null) {
          <p class="text-sm font-semibold text-emerald-700">✏️ Editing chore</p>
        }
        <input
          type="text"
          name="title"
          [(ngModel)]="form.title"
          placeholder="Chore (e.g. Take out the trash)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div class="flex gap-2">
          <select
            name="assignee"
            [(ngModel)]="form.assigneeUserId"
            aria-label="Assignee"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option [ngValue]="null">Unassigned</option>
            @for (m of members(); track m.id) {
              <option [ngValue]="m.id">{{ m.displayName }}</option>
            }
          </select>
          <select
            name="recurrence"
            [(ngModel)]="form.recurrence"
            aria-label="Recurrence"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            @for (rec of recurrences; track rec.value) {
              <option [ngValue]="rec.value">{{ rec.label }}</option>
            }
          </select>
        </div>
        <input
          type="date"
          name="dueDate"
          [(ngModel)]="form.dueDate"
          aria-label="Due date"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div class="flex gap-2">
          <button
            type="submit"
            [disabled]="!form.title.trim()"
            class="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            {{ editingId() === null ? 'Add chore' : 'Save changes' }}
          </button>
          @if (editingId() !== null) {
            <button
              type="button"
              class="shrink-0 rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-100"
              (click)="cancelEdit()"
            >
              Cancel
            </button>
          }
        </div>
      </form>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else {
        @if (toDo().length) {
          <ul class="space-y-2">
            @for (c of toDo(); track c.id) {
              <li class="rounded-xl border border-slate-200 bg-white p-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="truncate font-medium">{{ c.title }}</p>
                    <p class="text-xs text-slate-500">
                      {{ c.assigneeName ? '👤 ' + c.assigneeName : 'Unassigned' }}
                      @if (c.recurrence !== 'NONE') { · {{ recurrenceLabel(c.recurrence) }} }
                    </p>
                    @if (c.dueDate) {
                      <p class="mt-1 text-xs font-medium" [class]="dueColor(c)">📅 {{ dueText(c) }}</p>
                    }
                  </div>
                  <div class="flex shrink-0 flex-col items-end gap-1">
                    <button
                      type="button"
                      class="rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                      (click)="markDone(c)"
                    >
                      Mark done
                    </button>
                    <div class="flex gap-1">
                      <button type="button" class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" (click)="startEdit(c)" [attr.aria-label]="'Edit ' + c.title">✏️</button>
                      <button type="button" class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" (click)="remove(c)" [attr.aria-label]="'Remove ' + c.title">🗑️</button>
                    </div>
                  </div>
                </div>
              </li>
            }
          </ul>
        } @else {
          <p class="py-8 text-center text-slate-400">No chores to do. Nice! 🧹</p>
        }

        @if (done().length) {
          <h3 class="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">Done ({{ done().length }})</h3>
          <ul class="space-y-2">
            @for (c of done(); track c.id) {
              <li class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <div class="min-w-0 opacity-60">
                  <p class="truncate font-medium line-through">{{ c.title }}</p>
                  <p class="text-xs text-slate-500">{{ c.assigneeName ? '👤 ' + c.assigneeName : 'Unassigned' }}</p>
                </div>
                <button type="button" class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" (click)="remove(c)" [attr.aria-label]="'Remove ' + c.title">🗑️</button>
              </li>
            }
          </ul>
        }
      }
    </section>
  `,
})
export class ChoresComponent implements OnInit {
  private readonly service = inject(ChoreService);
  private readonly familyService = inject(FamilyService);

  protected readonly recurrences = CHORE_RECURRENCES;
  protected form: ChoreForm = emptyForm();
  protected readonly editingId = signal<number | null>(null);

  protected readonly chores = signal<Chore[]>([]);
  protected readonly members = signal<FamilyMember[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly toDo = computed(() => this.chores().filter((c) => !c.done));
  protected readonly done = computed(() => this.chores().filter((c) => c.done));

  ngOnInit(): void {
    forkJoin({ chores: this.service.list(), family: this.familyService.get() }).subscribe({
      next: ({ chores, family }) => {
        this.chores.set(chores);
        this.members.set(family.members);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load chores. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected recurrenceLabel(r: ChoreRecurrence): string {
    return CHORE_RECURRENCES.find((x) => x.value === r)?.label ?? '';
  }

  protected dueText(c: Chore): string {
    return dueLabel(daysUntilDue(c.dueDate)) ?? '';
  }

  protected dueColor(c: Chore): string {
    return dueColorClass(daysUntilDue(c.dueDate));
  }

  protected startEdit(c: Chore): void {
    this.editingId.set(c.id ?? null);
    this.form = {
      title: c.title,
      assigneeUserId: c.assigneeUserId ?? null,
      dueDate: c.dueDate ?? '',
      recurrence: c.recurrence,
    };
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form = emptyForm();
  }

  protected submit(): void {
    const title = this.form.title.trim();
    if (!title) return;
    this.error.set(null);
    const payload: Chore = {
      title,
      assigneeUserId: this.form.assigneeUserId ?? null,
      dueDate: this.form.dueDate || null,
      recurrence: this.form.recurrence,
      done: false,
    };
    const id = this.editingId();
    if (id !== null) {
      const existing = this.chores().find((c) => c.id === id);
      payload.done = existing?.done ?? false;
      this.service.update(id, payload).subscribe({
        next: (saved) => {
          this.chores.update((list) => list.map((c) => (c.id === saved.id ? saved : c)));
          this.cancelEdit();
        },
        error: () => this.error.set('Could not save changes. Please try again.'),
      });
    } else {
      this.service.add(payload).subscribe({
        next: (saved) => {
          this.chores.update((list) => [...list, saved]);
          this.form = emptyForm();
        },
        error: () => this.error.set('Could not add the chore. Please try again.'),
      });
    }
  }

  protected markDone(c: Chore): void {
    if (c.id == null) return;
    this.service.markDone(c.id).subscribe({
      next: (saved) => this.chores.update((list) => list.map((x) => (x.id === saved.id ? saved : x))),
      error: () => this.error.set('Could not update the chore. Please try again.'),
    });
  }

  protected remove(c: Chore): void {
    if (c.id == null) return;
    if (this.editingId() === c.id) this.cancelEdit();
    this.service.remove(c.id).subscribe({
      next: () => this.chores.update((list) => list.filter((x) => x.id !== c.id)),
      error: () => this.error.set('Could not remove the chore. Please try again.'),
    });
  }
}
