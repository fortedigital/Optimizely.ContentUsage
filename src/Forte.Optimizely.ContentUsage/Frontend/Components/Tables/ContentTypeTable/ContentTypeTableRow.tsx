import { Table, Dropdown, ButtonIcon } from "optimizely-oui";
import React, { FC, useCallback } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { ContentTypeDto } from "../../../dtos";
import { TableColumn } from "../../../types";
import { useTranslations } from "../../../Contexts/TranslationsProvider";
import { useNavigate } from "react-router-dom";
import { viewContentTypeUsages } from "../../../routes";
import TableRow from "../TableRow";

interface ContentTypeTableRowProps {
  row: ContentTypeDto;
  tableColumns: TableColumn<ContentTypeDto>[];
}

const ContentTypeTableRow: FC<ContentTypeTableRowProps> = ({
  row,
  tableColumns,
}) => {
  const translations = useTranslations();
  const {
    views: {
      contentTypesView: {
        table: { actions },
      },
    },
  } = translations;

  const navigate = useNavigate();

  const onTableRowClick = useCallback(
    (guid: string, alwaysTriggerClick = false) =>
      (event: React.PointerEvent) => {
        const target = event.target as HTMLTableCellElement | undefined;

        if ((target && target.tagName === "TD") || alwaysTriggerClick) {
          navigate(viewContentTypeUsages(guid));
        }
      },
    [navigate]
  );

  return (
    <TableRow
      key={row.guid}
      row={row}
      tableColumns={tableColumns}
      onTableRowClick={onTableRowClick(row.guid)}
      additionalCellAtTheRowEnd={
        <Table.TD verticalAlign="middle">
          <Dropdown
            activator={
              <ButtonIcon
                iconName="ellipsis"
                size="small"
                style="plain"
                title={actions.title}
              />
            }
          >
            <Dropdown.Contents>
              <Dropdown.ListItem
                onClick={onTableRowClick(row.guid, true)}
              >
                <Dropdown.BlockLink>
                  <Dropdown.BlockLinkText text={actions.viewUsages} />
                </Dropdown.BlockLink>
              </Dropdown.ListItem>
              <Dropdown.ListItem>
                <CopyToClipboard text={row.guid}>
                  <Dropdown.BlockLink>
                    <Dropdown.BlockLinkText text={actions.copyGuid} />
                  </Dropdown.BlockLink>
                </CopyToClipboard>
              </Dropdown.ListItem>
            </Dropdown.Contents>
          </Dropdown>
        </Table.TD>
      }
    />
  );
};

export default ContentTypeTableRow;
