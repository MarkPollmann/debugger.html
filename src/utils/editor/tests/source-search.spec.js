import { find, getMatchIndex, removeOverlay } from "../source-search";

const getCursor = jest.fn(() => ({ line: 90, ch: 54 }));
const cursor = {
  find: jest.fn(),
  from: jest.fn(),
  to: jest.fn()
};
const getSearchCursor = jest.fn(() => cursor);
const modifiers = {
  caseSensitive: false,
  regexMatch: false,
  wholeWord: false
};

const getCM = () => ({
  operation: jest.fn(cb => cb()),
  addOverlay: jest.fn(),
  removeOverlay: jest.fn(),
  getCursor,
  getSearchCursor,
  firstLine: jest.fn(),
  state: {}
});

describe("source-search", () => {
  describe("find", () => {
    it("calls into CodeMirror APIs via clearSearch & doSearch", () => {
      const ctx = { cm: getCM() };
      expect(ctx.cm.state).toEqual({});
      find(ctx, "test", false, modifiers);
      // First we check the APIs called via clearSearch
      expect(ctx.cm.removeOverlay).toHaveBeenCalledWith(null);
      // Next those via doSearch
      expect(ctx.cm.operation).toHaveBeenCalled();
      expect(ctx.cm.removeOverlay).toHaveBeenCalledWith(null);
      expect(ctx.cm.addOverlay).toHaveBeenCalledWith(
        { token: expect.any(Function) },
        { opaque: false }
      );
      expect(ctx.cm.getCursor).toHaveBeenCalledWith("anchor");
      expect(ctx.cm.getCursor).toHaveBeenCalledWith("head");
      const search = {
        query: "test",
        posTo: { line: 0, ch: 0 },
        posFrom: { line: 0, ch: 0 },
        overlay: { token: expect.any(Function) },
        results: []
      };
      expect(ctx.cm.state).toEqual({ search });
    });

    it("clears a previous overlay", () => {
      const ctx = { cm: getCM() };
      ctx.cm.state.search = {
        query: "foo",
        posTo: null,
        posFrom: null,
        overlay: { token: expect.any(Function) },
        results: []
      };
      find(ctx, "test", true, modifiers);
      expect(ctx.cm.removeOverlay).toHaveBeenCalledWith({
        token: expect.any(Function)
      });
    });

    it("clears for empty queries", () => {
      const ctx = { cm: getCM() };
      ctx.cm.state.search = {
        query: "foo",
        posTo: null,
        posFrom: null,
        overlay: null,
        results: []
      };
      find(ctx, null, true, modifiers);
      expect(ctx.cm.removeOverlay).toHaveBeenCalledWith(null);
      ctx.cm.removeOverlay.mockClear();
      ctx.cm.state.search.query = "bar";
      find(ctx, "", true, modifiers);
      expect(ctx.cm.removeOverlay).toHaveBeenCalledWith(null);
    });
  });

  describe("findNext", () => {});

  describe("findPrev", () => {});

  describe("getMatchIndex", () => {
    it("iterates in the matches", () => {
      const count = 3;

      // reverse 2, 1, 0, 2

      let matchIndex = getMatchIndex(count, 2, true);
      expect(matchIndex).toBe(1);

      matchIndex = getMatchIndex(count, 1, true);
      expect(matchIndex).toBe(0);

      matchIndex = getMatchIndex(count, 0, true);
      expect(matchIndex).toBe(2);

      // forward 1, 2, 0, 1

      matchIndex = getMatchIndex(count, 1, false);
      expect(matchIndex).toBe(2);

      matchIndex = getMatchIndex(count, 2, false);
      expect(matchIndex).toBe(0);

      matchIndex = getMatchIndex(count, 0, false);
      expect(matchIndex).toBe(1);
    });
  });

  describe("removeOverlay", () => {
    it("calls CodeMirror APIs: removeOverlay, getCursor & setSelection", () => {
      const ctx = {
        cm: {
          removeOverlay: jest.fn(),
          getCursor,
          state: {},
          doc: {
            setSelection: jest.fn()
          }
        }
      };
      removeOverlay(ctx, "test");
      expect(ctx.cm.removeOverlay).toHaveBeenCalled();
      expect(ctx.cm.getCursor).toHaveBeenCalled();
      expect(ctx.cm.doc.setSelection).toHaveBeenCalledWith(
        { line: 90, ch: 54 },
        { line: 90, ch: 54 },
        { scroll: false }
      );
    });
  });
});
