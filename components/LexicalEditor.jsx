'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { useEffect } from 'react'

// Minimal Lexical Editor Component
function LexicalEditor({ value, onChange, placeholder = 'Start typing...' }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (value !== undefined && editor) {
      editor.update(() => {
        const root = $getRoot()
        if (root.getTextContent() !== value) {
          root.clear()
          root.append($createParagraphNode().append($createTextNode(value)))
        }
      })
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) return

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot()
        const textContent = root.getTextContent()
        if (onChange && textContent !== value) {
          onChange(textContent)
        }
      })
    })
  }, [editor, onChange, value])

  return (
    <div className="border border-gray-300 rounded-md p-4">
      <RichTextPlugin
        contentEditable={<div className="outline-none min-h-[150px]" />}
        placeholder={<div className="text-gray-400">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </div>
  )
}

// Minimal Lexical Editor Wrapper
export default function LexicalEditorWrapper({ value, onChange, placeholder }) {
  const editorConfig = {
    namespace: 'MentorPathEditor',
    onError: (error) => {
      console.error('Lexical Editor Error:', error)
    },
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <LexicalEditor value={value} onChange={onChange} placeholder={placeholder} />
    </LexicalComposer>
  )
}
