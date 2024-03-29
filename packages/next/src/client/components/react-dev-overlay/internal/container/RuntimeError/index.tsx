import * as React from 'react'
import { CodeFrame } from '../../components/CodeFrame'
import { ReadyRuntimeError } from '../../helpers/getErrorByType'
import { noop as css } from '../../helpers/noop-template'
import { OriginalStackFrame } from '../../helpers/stack-frame'
import { groupStackFramesByFramework } from '../../helpers/group-stack-frames-by-framework'
import { CallStackFrame } from './CallStackFrame'
import { GroupedStackFrames } from './GroupedStackFrames'

export type RuntimeErrorProps = { error: ReadyRuntimeError }

const RuntimeError: React.FC<RuntimeErrorProps> = function RuntimeError({
  error,
}) {
  const firstFirstPartyFrameIndex = React.useMemo<number>(() => {
    return error.frames.findIndex(
      (entry) =>
        entry.expanded &&
        Boolean(entry.originalCodeFrame) &&
        Boolean(entry.originalStackFrame)
    )
  }, [error.frames])
  const firstFrame = React.useMemo<OriginalStackFrame | null>(() => {
    return error.frames[firstFirstPartyFrameIndex] ?? null
  }, [error.frames, firstFirstPartyFrameIndex])

  const allLeadingFrames = React.useMemo<OriginalStackFrame[]>(
    () =>
      firstFirstPartyFrameIndex < 0
        ? []
        : error.frames.slice(0, firstFirstPartyFrameIndex),
    [error.frames, firstFirstPartyFrameIndex]
  )

  const [all, setAll] = React.useState(firstFrame == null)
  const toggleAll = React.useCallback(() => {
    setAll((v) => !v)
  }, [])

  const leadingFrames = React.useMemo(
    () => allLeadingFrames.filter((f) => f.expanded || all),
    [all, allLeadingFrames]
  )
  const allCallStackFrames = React.useMemo<OriginalStackFrame[]>(
    () => error.frames.slice(firstFirstPartyFrameIndex + 1),
    [error.frames, firstFirstPartyFrameIndex]
  )
  const visibleCallStackFrames = React.useMemo<OriginalStackFrame[]>(
    () => allCallStackFrames.filter((f) => f.expanded || all),
    [all, allCallStackFrames]
  )

  const canShowMore = React.useMemo<boolean>(() => {
    return (
      allCallStackFrames.length !== visibleCallStackFrames.length ||
      (all && firstFrame != null)
    )
  }, [
    all,
    allCallStackFrames.length,
    firstFrame,
    visibleCallStackFrames.length,
  ])

  const stackFramesGroupedByFramework = React.useMemo(
    () => groupStackFramesByFramework(visibleCallStackFrames),
    [visibleCallStackFrames]
  )

  return (
    <React.Fragment>
      {firstFrame ? (
        <React.Fragment>
          <h5>Source</h5>
          {leadingFrames.map((frame, index) => (
            <CallStackFrame
              key={`leading-frame-${index}-${all}`}
              frame={frame}
            />
          ))}
          <CodeFrame
            stackFrame={firstFrame.originalStackFrame!}
            codeFrame={firstFrame.originalCodeFrame!}
          />
        </React.Fragment>
      ) : undefined}
      {stackFramesGroupedByFramework.length ? (
        <React.Fragment>
          <h5>Call Stack</h5>
          <GroupedStackFrames
            groupedStackFrames={stackFramesGroupedByFramework}
            all={all}
          />
        </React.Fragment>
      ) : undefined}
      {canShowMore ? (
        <React.Fragment>
          <button
            tabIndex={10}
            data-nextjs-data-runtime-error-collapsed-action
            type="button"
            onClick={toggleAll}
          >
            {all ? 'Hide' : 'Show'} collapsed frames
          </button>
        </React.Fragment>
      ) : undefined}
    </React.Fragment>
  )
}

export const styles = css`
  button[data-nextjs-data-runtime-error-collapsed-action] {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--size-font-small);
    line-height: var(--size-font-bigger);
    color: var(--color-accents-3);
  }

  [data-nextjs-call-stack-frame]:not(:last-child) {
    margin-bottom: var(--size-gap-double);
  }

  [data-nextjs-call-stack-frame] > h6 {
    margin-top: 0;
    margin-bottom: var(--size-gap);
    font-family: var(--font-stack-monospace);
    color: #222;
  }
  [data-nextjs-call-stack-frame] > h6[data-nextjs-frame-expanded='false'] {
    color: #666;
  }
  [data-nextjs-call-stack-frame] > div {
    display: flex;
    align-items: center;
    padding-left: calc(var(--size-gap) + var(--size-gap-half));
    font-size: var(--size-font-small);
    color: #999;
  }
  [data-nextjs-call-stack-frame] > div > svg {
    width: auto;
    height: var(--size-font-small);
    margin-left: var(--size-gap);

    display: none;
  }

  [data-nextjs-call-stack-frame] > div[data-has-source] {
    cursor: pointer;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source]:hover {
    text-decoration: underline dotted;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source] > svg {
    display: unset;
  }

  [data-nextjs-call-stack-framework-button] {
    border: none;
    background: none;
    display: flex;
    align-items: center;
    padding: 0;
    margin: var(--size-gap-double) 0;
  }
  [data-nextjs-call-stack-framework-icon] {
    margin-right: var(--size-gap);
  }
  [data-nextjs-call-stack-framework-icon='next'] > mask {
    mask-type: alpha;
  }
  [data-nextjs-call-stack-framework-icon='react'] {
    color: rgb(20, 158, 202);
  }
  [data-nextjs-call-stack-framework-button][data-state='open']
    > [data-nextjs-call-stack-chevron-icon] {
    transform: rotate(90deg);
  }
`

export { RuntimeError }
