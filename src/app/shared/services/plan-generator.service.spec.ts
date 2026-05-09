import { PlanGeneratorService, getVerseCount, CustomPlanConfig } from './plan-generator.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

describe('PlanGeneratorService', () => {
  let service: PlanGeneratorService;

  beforeEach(() => {
    service = new PlanGeneratorService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVerseCount', () => {
    it('returns verse count for known chapter', () => {
      expect(getVerseCount('Geneza 1')).toBe(31);
    });

    it('returns 0 for unknown chapter', () => {
      expect(getVerseCount('Unknown 999')).toBe(0);
    });
  });

  describe('generate', () => {
    it('returns empty array for empty books', () => {
      const config: CustomPlanConfig = { books: [], days: 30 };
      expect(service.generate(config)).toEqual([]);
    });

    it('returns empty array for zero days', () => {
      const config: CustomPlanConfig = { books: ['Geneza'], days: 0 };
      expect(service.generate(config)).toEqual([]);
    });

    it('generates plan for a single book', () => {
      const config: CustomPlanConfig = { books: ['Geneza'], days: 50 };
      const plan = service.generate(config);

      expect(plan.length).toBeGreaterThan(0);
      expect(plan[0]).toHaveProperty('week');
      expect(plan[0]).toHaveProperty('label');
      expect(plan[0]).toHaveProperty('days');
    });

    it('groups days into weeks of 7', () => {
      const config: CustomPlanConfig = { books: ['Geneza'], days: 14 };
      const plan = service.generate(config);

      expect(plan[0].days.length).toBeLessThanOrEqual(7);
      if (plan.length > 1) {
        expect(plan[1].days.length).toBeLessThanOrEqual(7);
      }
    });

    it('each day has chapters and label', () => {
      const config: CustomPlanConfig = { books: ['Geneza'], days: 10 };
      const plan = service.generate(config);

      for (const week of plan) {
        for (const day of week.days) {
          expect(day.chapters.length).toBeGreaterThan(0);
          expect(typeof day.label).toBe('string');
          expect(day.label.length).toBeGreaterThan(0);
        }
      }
    });

    it('all chapters are covered', () => {
      const config: CustomPlanConfig = { books: ['Geneza'], days: 50 };
      const plan = service.generate(config);

      const allChapters = plan.flatMap(w => w.days.flatMap(d => d.chapters));
      // Geneza has 50 chapters
      expect(allChapters.length).toBe(50);
      expect(allChapters[0]).toBe('Geneza 1');
      expect(allChapters[allChapters.length - 1]).toBe('Geneza 50');
    });

    it('supports multiple books', () => {
      const config: CustomPlanConfig = { books: ['Geneza', 'Exodul'], days: 40 };
      const plan = service.generate(config);

      const allChapters = plan.flatMap(w => w.days.flatMap(d => d.chapters));
      expect(allChapters).toContain('Geneza 1');
      expect(allChapters).toContain('Exodul 1');
    });

    it('supports places multiplier', () => {
      const config: CustomPlanConfig = { books: ['Geneza'], days: 25, places: 2 };
      const plan = service.generate(config);

      const allChapters = plan.flatMap(w => w.days.flatMap(d => d.chapters));
      expect(allChapters.length).toBe(50);
    });

    it('supports excludeCategories', () => {
      const config: CustomPlanConfig = {
        books: ['Geneza'],
        days: 50,
        excludeCategories: ['genealogies'],
      };
      const plan = service.generate(config);

      const allChapters = plan.flatMap(w => w.days.flatMap(d => d.chapters));
      // Geneza 5, 10, 36, 46 should be excluded
      expect(allChapters).not.toContain('Geneza 5');
      expect(allChapters).not.toContain('Geneza 10');
      expect(allChapters).not.toContain('Geneza 36');
      expect(allChapters).not.toContain('Geneza 46');
    });

    it('week numbers are sequential', () => {
      const config: CustomPlanConfig = { books: ['Geneza'], days: 30 };
      const plan = service.generate(config);

      for (let i = 0; i < plan.length; i++) {
        expect(plan[i].week).toBe(i + 1);
      }
    });
  });
});
