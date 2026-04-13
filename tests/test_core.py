"""Tests for flux-multilingual core utilities."""
import os
import sys
import tempfile
import pytest

# Add skills paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "docx", "scripts"))

# --- Project Structure Tests ---

PROJECT_ROOT = os.path.join(os.path.dirname(__file__), "..")


class TestProjectStructure:
    def test_readme_exists(self):
        assert os.path.isfile(os.path.join(PROJECT_ROOT, "README.md"))

    def test_license_exists(self):
        assert os.path.isfile(os.path.join(PROJECT_ROOT, "LICENSE"))

    def test_skills_directory_exists(self):
        assert os.path.isdir(os.path.join(PROJECT_ROOT, "skills"))

    def test_docx_skill_exists(self):
        assert os.path.isdir(os.path.join(PROJECT_ROOT, "skills", "docx"))

    def test_pdf_skill_exists(self):
        assert os.path.isdir(os.path.join(PROJECT_ROOT, "skills", "pdf"))

    def test_xlsx_skill_exists(self):
        assert os.path.isdir(os.path.join(PROJECT_ROOT, "skills", "xlsx"))

    def test_docx_utilities_exists(self):
        assert os.path.isfile(os.path.join(PROJECT_ROOT, "skills", "docx", "scripts", "utilities.py"))

    def test_pdf_script_exists(self):
        assert os.path.isfile(os.path.join(PROJECT_ROOT, "skills", "pdf", "scripts", "pdf.py"))

    def test_xlsx_script_exists(self):
        assert os.path.isfile(os.path.join(PROJECT_ROOT, "skills", "xlsx", "xlsx.py"))

    def test_at_least_10_skills(self):
        skills_dir = os.path.join(PROJECT_ROOT, "skills")
        entries = [e for e in os.listdir(skills_dir) if os.path.isdir(os.path.join(skills_dir, e))]
        assert len(entries) >= 10

    def test_gitignore_exists(self):
        assert os.path.isfile(os.path.join(PROJECT_ROOT, ".gitignore"))

    def test_roadmap_exists(self):
        assert os.path.isfile(os.path.join(PROJECT_ROOT, "ROADMAP.md"))


# --- XMLEditor Tests ---

class TestXMLEditor:
    SAMPLE_XML = """<?xml version="1.0" encoding="utf-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:body>
    <w:p w14:paraId="12345678">
      <w:r><w:t>Hello World</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>Second paragraph</w:t></w:r></w:p>
    <w:p w14:paraId="87654321">
      <w:r w:id="3"><w:t>Third paragraph</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"""

    def _write_xml(self, content=None):
        if content is None:
            content = self.SAMPLE_XML
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".xml", delete=False)
        tmp.write(content)
        tmp.close()
        return tmp.name

    def test_init_valid_file(self):
        from utilities import XMLEditor
        path = self._write_xml()
        try:
            editor = XMLEditor(path)
            assert editor is not None
            assert editor.encoding == "utf-8"
        finally:
            os.unlink(path)

    def test_init_missing_file_raises(self):
        from utilities import XMLEditor
        with pytest.raises(ValueError, match="XML file not found"):
            XMLEditor("/nonexistent/path/file.xml")

    def test_init_detects_ascii_encoding(self):
        from utilities import XMLEditor
        xml = '<?xml version="1.0" encoding="ascii"?>\n<root><item>test</item></root>'
        path = self._write_xml(xml)
        try:
            editor = XMLEditor(path)
            assert editor.encoding == "ascii"
        finally:
            os.unlink(path)

    def test_get_node_by_tag(self):
        from utilities import XMLEditor
        simple = '<?xml version="1.0"?>\n<root><unique>content</unique></root>'
        path = self._write_xml(simple)
        try:
            editor = XMLEditor(path)
            node = editor.get_node(tag="unique")
            assert node is not None
        finally:
            os.unlink(path)

    def test_get_node_by_attrs(self):
        from utilities import XMLEditor
        path = self._write_xml()
        try:
            editor = XMLEditor(path)
            node = editor.get_node(tag="w:r", attrs={"w:id": "3"})
            assert node is not None
        finally:
            os.unlink(path)

    def test_get_node_by_contains(self):
        from utilities import XMLEditor
        path = self._write_xml()
        try:
            editor = XMLEditor(path)
            node = editor.get_node(tag="w:t", contains="Second")
            assert node is not None
        finally:
            os.unlink(path)

    def test_get_node_not_found_raises(self):
        from utilities import XMLEditor
        path = self._write_xml()
        try:
            editor = XMLEditor(path)
            with pytest.raises(ValueError):
                editor.get_node(tag="w:nonexistent")
        finally:
            os.unlink(path)

    def test_pathlib_compatible(self):
        from utilities import XMLEditor
        from pathlib import Path
        path = self._write_xml()
        try:
            editor = XMLEditor(Path(path))
            assert editor is not None
        finally:
            os.unlink(path)

    def test_get_node_multiple_attrs(self):
        from utilities import XMLEditor
        path = self._write_xml()
        try:
            editor = XMLEditor(path)
            node = editor.get_node(tag="w:p", attrs={"w14:paraId": "87654321"})
            assert node is not None
        finally:
            os.unlink(path)

    def test_unicode_content_search(self):
        from utilities import XMLEditor
        xml = '<?xml version="1.0" encoding="utf-8"?>\n<root><item>Hello \u201cWorld\u201d</item></root>'
        path = self._write_xml(xml)
        try:
            editor = XMLEditor(path)
            node = editor.get_node(tag="item", contains="\u201cWorld\u201d")
            assert node is not None
        finally:
            os.unlink(path)
