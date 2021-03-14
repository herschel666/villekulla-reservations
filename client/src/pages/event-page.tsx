import type { FC } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { format, formatDuration } from 'date-fns';
import { de } from 'date-fns/locale';

import { useEventDetail } from '../hooks/use-event-detail';
import { deleteEvent } from '../api';

interface Params {
  resourceId: string;
  eventId: string;
}

export const EventPage: FC = () => {
  const history = useHistory();
  const { eventId, resourceId } = useParams<Params>();
  const event = useEventDetail(eventId);

  if (!event) {
    return <b>Loading event...</b>;
  }

  const backLink = `/resources/${resourceId}`;
  const start = new Date(event.start.replace(/\.000z$/i, ''));
  const end = new Date(event.end.replace(/\.000z$/i, ''));
  const from = format(start, 'd. LLLL yyyy, H:mm', { locale: de });
  const to = format(end, 'd. LLLL yyyy, H:mm', { locale: de });
  const duration = event.all_day
    ? null
    : formatDuration(
        {
          hours: end.getHours() - start.getHours(),
          minutes: end.getMinutes() - start.getMinutes(),
        },
        { format: ['hours', 'minutes'], locale: de }
      );
  const headingSuffix = duration
    ? `gebucht für ${duration}`
    : 'komplett gebucht';
  const handleDelete = () => {
    if (window.confirm('Soll der Eintrag wirklich geköscht werden?')) {
      deleteEvent(eventId).then(
        () => history.push(backLink),
        () => alert('Der Eintrag konnte nicht gelöscht werden.')
      );
    }
  };

  return (
    <>
      <Link to={backLink}>zurück</Link>
      <h1>
        {event.resource.name} {headingSuffix}
      </h1>
      <dl>
        <dt>Beginn</dt>
        <dd>{from} Uhr</dd>
        <dt>Ende</dt>
        <dd>{to} Uhr</dd>
        {event.description && (
          <>
            <dt>Zweck</dt>
            <dd>{event.description}</dd>
          </>
        )}
      </dl>
      <hr />
      <em>Gebucht von {event.user.fullName}</em>
      <button onClick={handleDelete}>Eintrag löschen</button>
    </>
  );
};
